"""Live demonstration script for Kaizen Agentic RAG Sales Consultant."""

import asyncio
import json
from app.agent import GroqRAGAgent


async def run_query(query: str):
    agent = GroqRAGAgent()
    print("=" * 60)
    print(f"CLIENT INQUIRY: {query}")
    print("=" * 60)

    async for sse_raw in agent.run_stream(user_message=query):
        event = json.loads(sse_raw)
        etype = event.get("type")
        if etype == "thought":
            print(f"\n🤔 [THOUGHT]: {event.get('content')}")
        elif etype == "tool_call":
            print(f"🛠️ [TOOL CALL]: {event.get('tool')} with args: {event.get('args')}")
        elif etype == "tool_result":
            preview = event.get("output_preview", "")
            print(f"📦 [TOOL RESULT]: {preview[:160]}...")
        elif etype == "token":
            print(event.get("content", ""), end="", flush=True)
        elif etype == "done":
            print("\n\n" + "=" * 60 + "\n✅ [STREAM COMPLETE]\n" + "=" * 60)


if __name__ == "__main__":
    test_query = (
        "I run a specialty coffee cafe with a bakery in Jubilee Hills. "
        "What package do you recommend, what are all the deliverables, turnaround time, "
        "total price, and payment terms?"
    )
    asyncio.run(run_query(test_query))
