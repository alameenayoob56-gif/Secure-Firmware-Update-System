from fastapi import FastAPI

app = FastAPI(
    title="Secure Firmware Update System"
)

@app.get("/")
def root():
    return {
        "message": "Secure Firmware Update System API"
    }