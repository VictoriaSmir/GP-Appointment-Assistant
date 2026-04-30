import os
import sys
import pytest
from unittest.mock import patch, MagicMock

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "backend"))

NHS_API_SUCCESS = {"value": [{
    "OrganisationName": "Abergavenny Medical Centre",
    "Address1": "10 High Street", "City": "Abergavenny",
    "Postcode": "NP7 5EE", "Phone": "01873 123456",
    "Email": "reception@abergavenny.nhs.uk",
    "Website": "https://abergavenny.co.uk",
    "NhsUrl": "/service-search/find-a-gp/results/NP7",
    "Latitude": 51.8227, "Longitude": -3.0171,
}]}

NHS_API_EMPTY    = {"value": []}

OVERPASS_SUCCESS = {"elements": [{
    "type": "node", "lat": 51.8227, "lon": -3.0171,
    "tags": {
        "name": "Abergavenny Surgery", "amenity": "doctors",
        "addr:street": "Castle Street", "addr:city": "Abergavenny",
        "addr:postcode": "NP7 5AA", "phone": "01873 654321",
        "email": "info@surgery.nhs.uk",
    },
}]}

OVERPASS_EMPTY = {"elements": []}

POSTCODES_IO_SUCCESS = {"status": 200, "result": {"latitude": 51.8227, "longitude": -3.0171}}
POSTCODES_IO_INVALID = {"status": 404, "error": "Invalid postcode"}


def mock_response(json_data, status_code=200):
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data
    resp.ok = status_code < 400
    return resp


try:
    from helpers import fetch_clinics, geocode_postcode
    HELPERS_AVAILABLE = True
except ImportError:
    HELPERS_AVAILABLE = False


@pytest.mark.skipif(not HELPERS_AVAILABLE, reason="helpers.py not importable")
class TestClinicFinderNHSAPI:

    @patch("helpers.httpx.get")
    def test_nhs_api_primary_source_used(self, mock_get):
        mock_get.return_value = mock_response(NHS_API_SUCCESS)
        results = fetch_clinics(lat=51.8227, lng=-3.0171)
        assert len(results) == 1
        assert results[0]["name"] == "Abergavenny Medical Centre"

    @patch("helpers.httpx.get")
    def test_result_has_required_fields(self, mock_get):
        mock_get.return_value = mock_response(NHS_API_SUCCESS)
        results = fetch_clinics(lat=51.8227, lng=-3.0171)
        for field in ("name", "address", "phone", "email", "lat", "lng"):
            assert field in results[0], f"Missing field: {field}"

    @patch("helpers.httpx.get")
    def test_email_preserved(self, mock_get):
        mock_get.return_value = mock_response(NHS_API_SUCCESS)
        results = fetch_clinics(lat=51.8227, lng=-3.0171)
        assert results[0]["email"] == "reception@abergavenny.nhs.uk"

    @patch("helpers.httpx.get")
    def test_nhs_url_prefixed_correctly(self, mock_get):
        mock_get.return_value = mock_response(NHS_API_SUCCESS)
        results = fetch_clinics(lat=51.8227, lng=-3.0171)
        assert results[0]["nhsUrl"].startswith("https://www.nhs.uk")


@pytest.mark.skipif(not HELPERS_AVAILABLE, reason="helpers.py not importable")
class TestClinicFinderFallback:

    @patch("helpers.httpx.post")
    @patch("helpers.httpx.get")
    def test_overpass_used_when_nhs_empty(self, mock_get, mock_post):
        mock_get.return_value  = mock_response(NHS_API_EMPTY)
        mock_post.return_value = mock_response(OVERPASS_SUCCESS)
        results = fetch_clinics(lat=51.8227, lng=-3.0171)
        assert len(results) == 1

    @patch("helpers.httpx.post")
    @patch("helpers.httpx.get")
    def test_overpass_used_when_nhs_fails(self, mock_get, mock_post):
        mock_get.side_effect   = Exception("NHS API timeout")
        mock_post.return_value = mock_response(OVERPASS_SUCCESS)
        results = fetch_clinics(lat=51.8227, lng=-3.0171)
        assert len(results) > 0

    @patch("helpers.httpx.post")
    @patch("helpers.httpx.get")
    def test_both_empty_returns_empty_list(self, mock_get, mock_post):
        mock_get.return_value  = mock_response(NHS_API_EMPTY)
        mock_post.return_value = mock_response(OVERPASS_EMPTY)
        assert fetch_clinics(lat=51.8227, lng=-3.0171) == []

    @patch("helpers.httpx.post")
    @patch("helpers.httpx.get")
    def test_both_fail_returns_empty_list(self, mock_get, mock_post):
        mock_get.side_effect  = Exception("down")
        mock_post.side_effect = Exception("down")
        assert fetch_clinics(lat=51.8227, lng=-3.0171) == []


@pytest.mark.skipif(not HELPERS_AVAILABLE, reason="helpers.py not importable")
class TestPostcodeGeocoding:

    @patch("helpers.httpx.get")
    def test_valid_postcode_returns_coordinates(self, mock_get):
        mock_get.return_value = mock_response(POSTCODES_IO_SUCCESS)
        result = geocode_postcode("NP7 5EE")
        assert result is not None
        assert result["lat"] == pytest.approx(51.8227, abs=0.001)

    @patch("helpers.httpx.get")
    def test_invalid_postcode_returns_none(self, mock_get):
        mock_get.return_value = mock_response(POSTCODES_IO_INVALID, status_code=404)
        assert geocode_postcode("ZZ99 9ZZ") is None

    @patch("helpers.httpx.get")
    def test_timeout_returns_none(self, mock_get):
        mock_get.side_effect = Exception("timeout")
        assert geocode_postcode("NP7 5EE") is None

    @patch("helpers.httpx.get")
    def test_postcode_whitespace_stripped(self, mock_get):
        mock_get.return_value = mock_response(POSTCODES_IO_SUCCESS)
        assert geocode_postcode("  NP7 5EE  ") is not None


@pytest.mark.skipif(not HELPERS_AVAILABLE, reason="helpers.py not importable")
class TestClinicResultStructure:

    @patch("helpers.httpx.get")
    def test_results_capped_at_ten(self, mock_get):
        many = {"value": [{
            "OrganisationName": f"Surgery {i}", "Address1": "1 High St",
            "City": "Town", "Postcode": "NP1 1AA", "Phone": "01234 567890",
            "Email": f"s{i}@nhs.uk", "Website": "", "NhsUrl": "/gp",
            "Latitude": 51.82 + i * 0.001, "Longitude": -3.01,
        } for i in range(20)]}
        mock_get.return_value = mock_response(many)
        assert len(fetch_clinics(lat=51.8227, lng=-3.0171)) <= 10

    @patch("helpers.httpx.get")
    def test_null_coordinates_excluded(self, mock_get):
        null_clinic = {"value": [{
            "OrganisationName": "No Location", "Address1": "Unknown",
            "City": "Unknown", "Postcode": "XX1 1XX", "Phone": "",
            "Email": "", "Website": "", "NhsUrl": "",
            "Latitude": None, "Longitude": None,
        }]}
        mock_get.return_value = mock_response(null_clinic)
        results = fetch_clinics(lat=51.8227, lng=-3.0171)
        assert all(r["lat"] is not None for r in results)