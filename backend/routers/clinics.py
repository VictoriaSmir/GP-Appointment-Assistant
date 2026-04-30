from fastapi import APIRouter
import httpx
import traceback

router = APIRouter()

@router.get("/find_clinics")
async def find_clinics(lat: float, lng: float):
    clinics = []

    try:
        url = (
            f"https://api.nhs.uk/service-search/search?api-version=2"
            f"&$filter=OrganisationTypeID eq 'GPB'"
            f"&$orderby=geo.distance(geo, geography'POINT({lng} {lat})')"
            f"&$top=10"
            f"&$select=OrganisationName,Address1,City,Postcode,Phone,Email,"
            f"Latitude,Longitude,Website,NhsUrl"
        )
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url, headers={"subscription-key": ""})
            if res.status_code == 200:
                data = res.json()
                clinics = [{
                    "name":    p.get("OrganisationName", ""),
                    "address": ", ".join(filter(None, [p.get("Address1"), p.get("City"), p.get("Postcode")])),
                    "phone":   p.get("Phone", ""),
                    "email":   p.get("Email", ""),
                    "website": p.get("Website", ""),
                    "nhsUrl":  f"https://www.nhs.uk{p['NhsUrl']}" if p.get("NhsUrl") else f"https://www.nhs.uk/service-search/find-a-gp/results/{p.get('Postcode', '')}",
                    "lat":     p.get("Latitude"),
                    "lng":     p.get("Longitude"),
                } for p in data.get("value", [])]
    except Exception as e:
        print(f"NHS API failed: {e}")

    # Overpass fallback
    if not clinics:
        try:
            query = f"""[out:json][timeout:15];
                (node["amenity"="doctors"](around:8000,{lat},{lng});
                 node["healthcare"="centre"](around:8000,{lat},{lng});
                 way["amenity"="doctors"](around:8000,{lat},{lng});
                );out center 10;"""
            async with httpx.AsyncClient(timeout=30) as client:
                res = await client.post(
                    "https://overpass-api.de/api/interpreter",
                    data={"data": query},
                    headers={"User-Agent": "GPAppointmentAssistant/1.0"}
                )
                print(f"Overpass status: {res.status_code}")
                print(f"Overpass response preview: {res.text[:200]}")
                if res.status_code == 200 and res.text.strip().startswith("{"):
                    data = res.json()
                    print(f"Overpass returned {len(data.get('elements', []))} elements")
                    for el in data.get("elements", [])[:10]:
                        t   = el.get("tags", {})
                        ela = el.get("lat") or (el.get("center") or {}).get("lat")
                        eln = el.get("lon") or (el.get("center") or {}).get("lon")
                        pc  = t.get("addr:postcode", "")
                        if ela and eln:
                            clinics.append({
                                "name":    t.get("name") or t.get("operator") or "GP Practice",
                                "address": ", ".join(filter(None, [t.get("addr:housenumber"), t.get("addr:street"), t.get("addr:city") or t.get("addr:town"), pc])),
                                "phone":   t.get("phone") or t.get("contact:phone", ""),
                                "email":   t.get("email") or t.get("contact:email", ""),
                                "website": t.get("website") or t.get("contact:website", ""),
                                "nhsUrl":  f"https://www.nhs.uk/service-search/find-a-gp/results/{pc}",
                                "lat":     ela,
                                "lng":     eln,
                            })
                else:
                    print(f"Overpass returned unexpected response: {res.status_code}")
        except Exception as e:
            print(f"Overpass failed: {e}")
            print(f"Overpass traceback: {traceback.format_exc()}")

    return {"clinics": clinics}


@router.get("/geocode_postcode")
async def geocode_postcode(postcode: str):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(f"https://api.postcodes.io/postcodes/{postcode}")
            data = res.json()
            if data.get("status") == 200:
                return {"lat": data["result"]["latitude"], "lng": data["result"]["longitude"]}
    except Exception as e:
        print(f"Geocode failed: {e}")
    return {"error": "Invalid postcode"}