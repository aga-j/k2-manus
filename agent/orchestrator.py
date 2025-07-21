import os, json, uuid, docker, sseclient
from openai import OpenAI

client = OpenAI(base_url="http://k2-api:8000/v1", api_key="EMPTY")
docker_cli = docker.from_env()

TOOLS = json.load(open("agent/tools.json"))

def run_task(prompt):
    messages = [{"role": "user", "content": prompt}]
    while True:
        resp = client.chat.completions.create(
            model="moonshotai/Kimi-K2-Instruct",
            messages=messages,
            tools=TOOLS,
            temperature=0.3,
            max_tokens=2048,
            tool_choice="auto"
        )
        choice = resp.choices[0]
        if not choice.message.tool_calls:
            yield {"type": "final", "text": choice.message.content}
            break
        for call in choice.message.tool_calls:
            result = exec_in_sandbox(call.function.name, call.function.arguments)
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
            yield {"type": "log", "cmd": f"{call.function.name}({call.function.arguments})", "stdout": result}

def exec_in_sandbox(func: str, args: str) -> str:
    cid = uuid.uuid4().hex
    try:
        container = docker_cli.containers.run(
            "sandbox",
            command=["python", "-c",
                     f"import json,sys; from tools import {func}; print({func}(**json.loads(sys.argv[1])))",
                     args],
            detach=False, remove=True, name=cid,
            volumes={os.getcwd() + "/shared": {"bind": "/shared", "mode": "rw"}}
        )
        return container.decode()
    except Exception as e:
        return str(e)
