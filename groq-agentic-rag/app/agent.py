"""Production-grade Agentic RAG reasoning loop powered by Groq and FastEmbed."""

import json
from typing import Any, AsyncGenerator, Dict, List, Optional
from groq import Groq

from app.config import get_settings
from app.tools import AVAILABLE_TOOLS, execute_tool
from app.vector_store import VectorStore

SYSTEM_PROMPT = """You are the Senior Technical Sales Director & Solutions Architect for Kaizen Software Agency.

Your core mission is to act as an elite, high-converting enterprise sales consultant:
- Deeply understand the client's business context and operational pain points.
- Structure recommendations persuasively with clean markdown cost-distribution tables.
- Render crisp ASCII system architecture diagrams illustrating how the solution components connect.
- Decisively close deals and issue copy-ready project briefs when the client shows buying interest ("I am ready", "let's do it", "how to buy", "book this", "I want to purchase", "proceed", "yes", etc.).

### 1. SALES PRESENTATION & EXPLANATION STANDARDS:
- Act like an experienced, highly confident technical consultant: articulate the exact business value, speed to market, and technical advantage.
- When explaining multi-component solutions (e.g., existing website + WhatsApp order bot + admin dashboard), include a clean, sharp ASCII system architecture diagram:
```text
┌──────────────────────┐       ┌────────────────────────┐       ┌──────────────────────┐
│ Client Website /     │ ───>  │ 24/7 WhatsApp Order    │ ───>  │ Live Admin Order     │
│ Customer Order Form  │       │ & Intake Bot Engine    │       │ Management Dashboard │
└──────────────────────┘       └────────────────────────┘       └──────────────────────┘
```
- Always distribute costs and scope in clear, well-structured markdown tables:
| Component / Package | What's Included | Investment | 30% Advance | 70% Balance | Turnaround |
|---|---|---|---|---|---|
- For payment terms / milestones:
| Milestone | Percentage / Amount | Trigger / Condition |
|---|---|---|
| Phase 1: Advance | 30% | Kick-off & engineering sprint reservation |
| Phase 2: Final Balance | 70% | Paid only upon client approval & live testing |
- For ongoing care/retainers (if inquired or relevant):
| Care Plan | Monthly Fee | What's Covered |
|---|---|---|
| Growth Care (Recommended) | ₹2,999 / mo | Weekly backups, security monitoring, up to 4 hrs of monthly feature/content tweaks |
| Essential Security | ₹1,499 / mo | Backups + 99.9% uptime & security monitoring only |
| Dedicated Engineering Retainer | ₹5,999 / mo | Up to 10 hrs custom development + priority SLA |
- PREVENT DOUBLE-CHARGING / CLARIFY SCOPE:
  - If a client needs a WhatsApp order bot and an admin dashboard, clarify immediately that the Growth Engine Bundle (₹11,999) ALREADY includes both the automated WhatsApp inquiry/order responder bot AND the client-order dashboard. State clearly that both come in that single bundle.
- ANSWER DIRECT QUESTIONS UPFRONT:
  - If asked about "is the first year free for the monthly subscription?", explicitly answer upfront:
    - Monthly care plans are completely optional.
    - The first year of monthly subscription is NOT free.
    - However, standard 30 days of post-delivery bug-fix & hyper-care support is included free with the bundle.

### 2. DEAL CLOSING & BUYING INTENT PROTOCOL (CRITICAL):
When the client expresses intent to purchase, says "okay I am ready", "let's do it", "how do I start", "I want to buy", "book this", "how do I pay the advance", or confirms any proposal:
You MUST immediately switch into Closing & Onboarding Mode:
1. Recap What The Client Liked & Wanted:
   - "🎯 What You Wanted": Explicitly recap their exact business requirement and operational problem (e.g. automated WhatsApp order-intake from existing website + real-time admin order dashboard).
   - "⭐ What You Liked in This Solution": Explicitly detail why the client liked this package and what made them choose it (e.g. Growth Engine Bundle includes both components for flat ₹11,999 saving duplicate fees, 30% kickoff advance with 70% balance on approval, 100% full source-code ownership, and rapid 7–10 day turnaround).
2. Present the Official Locked Deal Summary Table:
| Package / Scope | Total Investment | 30% Kick-off Advance | 70% Balance on Approval | Turnaround |
|---|---|---|---|---|
3. Issue the Official WhatsApp Project Brief Slip:
   Present an official, copy-ready project slip formatted in a code block like this:
```text
🚀 OFFICIAL PROJECT BRIEF — READY TO INITIATE
• What You Wanted: [Client's exact requirement e.g. WhatsApp order intake from website + live admin dashboard]
• What You Liked: [Why this was chosen e.g. Growth Engine Bundle combines both for ₹11,999 with zero duplicate fees & 100% code ownership]
• Selected Package: [Package Name e.g. Growth Engine Bundle]
• Total Investment: [Total Amount e.g. ₹11,999]
• 30% Advance: [Amount e.g. ₹3,600] (Secures sprint kickoff)
• 70% Balance: [Amount e.g. ₹8,399] (Payable upon delivery approval)
• Turnaround: [Days e.g. 7–10 Business Days]
• Next Step: Click 'Lock In on WhatsApp' below to dispatch this brief and receive onboarding instructions.
```
4. Instruct the client to click the WhatsApp action button right below your message to lock in their engineering slot immediately with our director.

### 3. STRICT COMMERCIAL POLICIES & CITATIONS:
- 30% advance required to initiate work; 70% balance payable ONLY after final delivery approval.
- 100% full source code and asset ownership transferred upon completion.
- Always include verified inline citations for pricing, packages, or turnaround: `[Source: <filename>, Chunk: <id>]`.
- Zero hallucinations: only offer services, prices, and bundles defined in the knowledge base.
"""


class GroqRAGAgent:
    """Agentic RAG Controller executing Groq tool-calling loops with streaming SSE output."""

    def __init__(self, vector_store: Optional[VectorStore] = None) -> None:
        self.settings = get_settings()
        self.client = Groq(api_key=self.settings.GROQ_API_KEY)
        self.vector_store = vector_store or VectorStore.get_instance()

    def rewrite_query_for_search(self, user_query: str, previous_failed_query: str = "") -> str:
        """Use fast model (llama-3.1-8b-instant) to generate optimal keyword search queries."""
        prompt = (
            f"Convert the following user inquiry into 2-5 focused semantic search keywords "
            f"for retrieving software agency services, pricing, packages, and technical capabilities.\n"
            f"User Inquiry: {user_query}\n"
        )
        if previous_failed_query:
            prompt += f"Note: A previous search for '{previous_failed_query}' yielded poor results. Use different synonyms."

        try:
            resp = self.client.chat.completions.create(
                model=self.settings.FAST_MODEL,
                messages=[
                    {"role": "system", "content": "You are a concise search query optimizer. Output ONLY keywords separated by spaces. No markdown, no punctuation."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.1,
                max_tokens=60,
            )
            content = resp.choices[0].message.content
            return content.strip() if content else user_query
        except Exception:
            return user_query

    async def run_stream(
        self,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
    ) -> AsyncGenerator[str, None]:
        """Execute the agentic reasoning and tool-calling loop, streaming SSE events."""
        messages: List[Dict[str, Any]] = [{"role": "system", "content": SYSTEM_PROMPT}]

        # Inject conversation history if available
        if chat_history:
            for msg in chat_history[-6:]:
                messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

        messages.append({"role": "user", "content": user_message})

        yield json.dumps({"type": "thought", "content": "Thinking..."})

        # Phase 1: Rapid Tool Decision & Retrieval
        try:
            # Fast tool decision call (generates tool call JSON without truncation)
            response = self.client.chat.completions.create(
                model=self.settings.AGENT_MODEL,
                messages=messages,
                tools=AVAILABLE_TOOLS,
                tool_choice="auto",
                temperature=0.1,
                max_tokens=350,
            )
        except Exception as e:
            yield json.dumps({"type": "error", "content": f"Groq API Error: {str(e)}"})
            yield json.dumps({"type": "done"})
            return

        choice = response.choices[0]
        message = choice.message

        # If model requested retrieval tool execution
        if message.tool_calls:
            messages.append(
                {
                    "role": "assistant",
                    "content": message.content or None,
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            },
                        }
                        for tc in message.tool_calls
                    ],
                }
            )

            for tc in message.tool_calls:
                fn_name = tc.function.name
                try:
                    fn_args = json.loads(tc.function.arguments)
                except json.JSONDecodeError:
                    fn_args = {"query": user_message}

                yield json.dumps({
                    "type": "tool_call",
                    "tool": fn_name,
                    "args": fn_args,
                })

                # Execute local FastEmbed / ChromaDB retrieval
                tool_output = execute_tool(
                    name=fn_name,
                    args=fn_args,
                    vector_store=self.vector_store,
                )

                # Self-correction: if search returned no results, retry with rewritten query
                if fn_name == "search_knowledge_base" and "No relevant documents found" in tool_output:
                    yield json.dumps({
                        "type": "thought",
                        "content": "Initial retrieval produced zero matches. Self-correcting search query...",
                    })
                    rewritten = self.rewrite_query_for_search(
                        user_query=user_message,
                        previous_failed_query=fn_args.get("query", ""),
                    )
                    fn_args["query"] = rewritten
                    tool_output = execute_tool(
                        name=fn_name,
                        args=fn_args,
                        vector_store=self.vector_store,
                    )

                yield json.dumps({
                    "type": "tool_result",
                    "tool": fn_name,
                    "output_preview": tool_output[:250] + "..." if len(tool_output) > 250 else tool_output,
                })

                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": tool_output,
                    }
                )

        # Phase 2: Final Direct Synthesis Streaming (starts IMMEDIATELY with zero blocking delay)
        yield json.dumps({"type": "thought", "content": "Thinking..."})

        try:
            stream = self.client.chat.completions.create(
                model=self.settings.AGENT_MODEL,
                messages=messages,
                temperature=0.1,
                stream=True,
                max_tokens=1500,
            )

            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                    token = chunk.choices[0].delta.content
                    yield json.dumps({"type": "token", "content": token})

        except Exception as e:
            yield json.dumps({"type": "error", "content": f"Streaming Error: {str(e)}"})

        yield json.dumps({"type": "done"})
