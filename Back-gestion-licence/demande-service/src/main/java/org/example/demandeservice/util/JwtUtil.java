package org.example.demandeservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.function.Function;

@Component
public class JwtUtil {
    private final String SECRET_KEY = "a6061b167d7fdc685d0b20ccae4d1656c51cadbbdd320368243bfd6b64c5f6c7";

    // Extraire l'ID utilisateur à partir du token
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> {
            Object id = claims.get("id");
            if (id instanceof Number) {
                return ((Number) id).longValue();
            } else {
                throw new IllegalArgumentException("Claim 'id' is not a number");
            }
        });
    }
    // Extraire le username à partir du token (facultatif)
//    public String extractUsername(String token) {
//        return extractClaim(token, Claims::getSubject);
//    }

    // Méthode générique pour extraire un champ du token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extraire toutes les claims du token
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigninKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Récupère la clé de signature
    private SecretKey getSigninKey() {
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64URL.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
