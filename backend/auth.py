
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.algorithms import RSAAlgorithm
import requests

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Replace with your Auth0 domain and API audience
AUTH0_DOMAIN = "YOUR_AUTH0_DOMAIN"
API_AUDIENCE = "YOUR_API_AUDIENCE"
ALGORITHMS = ["RS256"]

class UnverifiedToken(Exception):
    pass

def get_token_auth_header(token: str = Depends(oauth2_scheme)):
    """Obtains the Access Token from the Authorization Header
    """
    return token

def get_public_key(domain):
    jwks_url = f"https://{domain}/.well-known/jwks.json"
    jwks = requests.get(jwks_url).json()
    return jwks

def get_current_user(token: str = Depends(get_token_auth_header)):
    """
    Decode and validate the JWT token.
    """
    try:
        jwks = get_public_key(AUTH0_DOMAIN)
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if rsa_key:
            payload = jwt.decode(
                token,
                RSAAlgorithm.from_jwk(rsa_key),
                algorithms=ALGORITHMS,
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTClaimsError:
        raise HTTPException(status_code=401, detail="Invalid claims, please check the audience and issuer")
    except Exception:
        raise HTTPException(status_code=401, detail="Unable to parse authentication token.")

    raise UnverifiedToken
