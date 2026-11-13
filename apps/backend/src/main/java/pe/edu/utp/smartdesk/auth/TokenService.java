package pe.edu.utp.smartdesk.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final byte[] secret;
    private final long minutes;
    public TokenService(@Value("${smartdesk.jwt.secret}") String secret,
                        @Value("${smartdesk.jwt.expiration-minutes:60}") long minutes) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8); this.minutes = minutes;
    }
    public String issue(String email, String role) {
        long now = System.currentTimeMillis() / 1000;
        String header = enc("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String body = enc("{\"sub\":\"" + email.replace("\"", "") + "\",\"role\":\"" + role + "\",\"exp\":" + (now + minutes * 60) + "}");
        String data = header + "." + body;
        return data + "." + sign(data);
    }
    public Claims verify(String token) {
        try {
            String[] p = token.split("\\.");
            if (p.length != 3 || !MessageDigest.isEqual(sign(p[0] + "." + p[1]).getBytes(StandardCharsets.UTF_8), p[2].getBytes(StandardCharsets.UTF_8))) return null;
            String json = new String(Base64.getUrlDecoder().decode(p[1]), StandardCharsets.UTF_8);
            String email = claim(json, "sub"), role = claim(json, "role");
            if (Long.parseLong(claim(json, "exp")) <= System.currentTimeMillis() / 1000) return null;
            return new Claims(email, role);
        } catch (RuntimeException ex) { return null; }
    }
    private String sign(String text) {
        try { Mac m=Mac.getInstance("HmacSHA256"); m.init(new SecretKeySpec(secret,"HmacSHA256")); return Base64.getUrlEncoder().withoutPadding().encodeToString(m.doFinal(text.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception ex) { throw new IllegalStateException(ex); }
    }
    private static String enc(String s) { return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes(StandardCharsets.UTF_8)); }
    private static String claim(String json, String name) {
        var m=java.util.regex.Pattern.compile("\""+name+"\"\\s*:\\s*(?:\"([^\"]*)\"|(\\d+))").matcher(json);
        if(!m.find()) throw new IllegalArgumentException(); return m.group(1)==null?m.group(2):m.group(1);
    }
    public record Claims(String email, String role) {}
}
