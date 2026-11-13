package pe.edu.utp.smartdesk.auth;

import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenService tokens;
    public JwtAuthenticationFilter(TokenService tokens) { this.tokens=tokens; }
    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        String h=req.getHeader("Authorization");
        if(h!=null && h.startsWith("Bearer ")) {
            var c=tokens.verify(h.substring(7));
            if(c!=null) SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(c.email(),null,List.of(new SimpleGrantedAuthority("ROLE_"+c.role()))));
        }
        chain.doFilter(req,res);
    }
}
