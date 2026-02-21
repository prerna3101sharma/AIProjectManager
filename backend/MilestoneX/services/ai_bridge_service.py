import tempfile
import subprocess
import json


class AIBridgeService:

    @staticmethod
    def run_ai(text: str):

        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as temp:
            temp.write(text.encode("utf-8"))
            temp_path = temp.name

        process = subprocess.run(
            ["python", "ai_engine.py", temp_path],
            capture_output=True,
            text=True
        )

        if process.returncode != 0:
            raise Exception(process.stderr)

        return json.loads(process.stdout)