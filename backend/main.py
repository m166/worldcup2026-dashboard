from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="World Cup 2026 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY"),
)

BASE_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026"

FLAGS = {
    "Mexico": "MX", "South Africa": "ZA", "South Korea": "KR",
    "Czech Republic": "CZ", "Canada": "CA", "Bosnia & Herzegovina": "BA",
    "Qatar": "QA", "Switzerland": "CH", "Brazil": "BR", "Morocco": "MA",
    "Haiti": "HT", "Scotland": "GB-SCT", "USA": "US", "Paraguay": "PY",
    "Australia": "AU", "Turkey": "TR", "Germany": "DE", "Curaçao": "CW",
    "Ivory Coast": "CI", "Ecuador": "EC", "Netherlands": "NL", "Japan": "JP",
    "Sweden": "SE", "Tunisia": "TN", "Belgium": "BE", "Egypt": "EG",
    "Iran": "IR", "New Zealand": "NZ", "Spain": "ES", "Cape Verde": "CV",
    "Saudi Arabia": "SA", "Uruguay": "UY", "France": "FR", "Senegal": "SN",
    "Iraq": "IQ", "Norway": "NO", "Argentina": "AR", "Algeria": "DZ",
    "Austria": "AT", "Jordan": "JO", "Portugal": "PT", "DR Congo": "CD",
    "Uzbekistan": "UZ", "Colombia": "CO", "England": "GB-ENG",
    "Croatia": "HR", "Ghana": "GH", "Panama": "PA",
}

def enrich_team(name):
    code = FLAGS.get(name)
    return {
        "name": name,
        "flag": f"https://flagsapi.com/{code}/flat/64.png" if code else None,
        "code": code,
    }

def enrich_match(match, placares_map):
    key = f"{match.get('team1')}_{match.get('team2')}_{match.get('date')}"
    placar = placares_map.get(key)
    return {
        **match,
        "team1_info": enrich_team(match.get("team1", "")),
        "team2_info": enrich_team(match.get("team2", "")),
        "score1": placar["score1"] if placar else None,
        "score2": placar["score2"] if placar else None,
        "placar_id": placar["id"] if placar else None,
    }

@app.get("/")
def root():
    return {"message": "World Cup 2026 API rodando! 🏆"}

@app.get("/jogos")
async def get_jogos():
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{BASE_URL}/worldcup.json")
        data = response.json()

    # Busca placares do banco
    result = supabase.table("placares").select("*").execute()
    placares_map = {
        f"{p['team1']}_{p['team2']}_{p['date']}": p
        for p in result.data
    }

    matches = [enrich_match(m, placares_map) for m in data.get("matches", [])]
    return {"name": data.get("name"), "matches": matches}

# Model para receber o placar
class PlacarInput(BaseModel):
    team1: str
    team2: str
    score1: int
    score2: int
    date: str
    group_name: str = None

@app.post("/placar")
def salvar_placar(placar: PlacarInput):
    # Verifica se já existe
    existing = supabase.table("placares").select("*")\
        .eq("team1", placar.team1)\
        .eq("team2", placar.team2)\
        .eq("date", placar.date)\
        .execute()

    if existing.data:
        # Atualiza
        result = supabase.table("placares")\
            .update({"score1": placar.score1, "score2": placar.score2})\
            .eq("id", existing.data[0]["id"])\
            .execute()
    else:
        # Insere
        result = supabase.table("placares").insert({
            "team1": placar.team1,
            "team2": placar.team2,
            "score1": placar.score1,
            "score2": placar.score2,
            "date": placar.date,
            "group_name": placar.group_name,
        }).execute()

    return {"success": True, "data": result.data}

@app.delete("/placar/{placar_id}")
def deletar_placar(placar_id: int):
    supabase.table("placares").delete().eq("id", placar_id).execute()
    return {"success": True}