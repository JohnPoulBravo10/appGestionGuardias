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
    private boolean activo;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(
            Long id,
            String usuario,
            String password,
            Long empleadoDni,
            boolean activo,
            Collection<? extends GrantedAuthority> authorities
    ) {
        this.id = id;
        this.usuario = usuario;
        this.password = password;
        this.empleadoDni = empleadoDni;
        this.activo = activo;
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
                usuario.isActivo(),
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

    /**
     * Retorna si el usuario está habilitado.
     * Un usuario dado de baja (activo = false) no podrá autenticarse.
     */
    @Override
    public boolean isEnabled() {
        return activo;
    }
}