package com.sistema.guardias.autenticacion_service.security;

import com.sistema.guardias.autenticacion_service.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String usuario;
    private String password;
    private Long empleadoDni;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(
            Long id,
            String usuario,
            String password,
            Long empleadoDni,
            Collection<? extends GrantedAuthority> authorities
    ) {
        this.id = id;
        this.usuario = usuario;
        this.password = password;
        this.empleadoDni = empleadoDni;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(Usuario usuario) {
        GrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name());

        return new UserDetailsImpl(
                usuario.getId(),
                usuario.getUsuario(),
                usuario.getPassword(),
                usuario.getEmpleadoDni(),
                Collections.singletonList(authority)
        );
    }

    public Long getId() {
        return id;
    }

    public Long getEmpleadoDni() {
        return empleadoDni;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return usuario;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}