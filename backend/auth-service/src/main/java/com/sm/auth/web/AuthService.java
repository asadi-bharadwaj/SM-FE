package com.sm.auth.web;

import com.sm.auth.client.ProfileProvisioningClient;
import com.sm.auth.domain.User;
import com.sm.auth.domain.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final ProfileProvisioningClient profileProvisioningClient;

  public AuthService(
      UserRepository userRepository,
      PasswordEncoder passwordEncoder,
      ProfileProvisioningClient profileProvisioningClient) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.profileProvisioningClient = profileProvisioningClient;
  }

  public LoginResponse register(RegisterRequest req) {
    if (userRepository.findByEmailIgnoreCase(req.getEmail()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }
    if (userRepository.findByUsernameIgnoreCase(req.getUsername()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Username taken");
    }

    User u = new User();
    u.setId(nextUserId());
    u.setEmail(req.getEmail().trim().toLowerCase());
    u.setUsername(req.getUsername().trim());
    u.setDisplayName(req.getUsername().trim());
    u.setPasswordHash(passwordEncoder.encode(req.getPassword()));
    userRepository.save(u);

    profileProvisioningClient.provision(u.getId(), u.getUsername(), u.getDisplayName());

    return toLoginResponse(u);
  }

  private long nextUserId() {
    return userRepository.findAll().stream().mapToLong(User::getId).max().orElse(0L) + 1;
  }

  public LoginResponse login(LoginRequest req) {
    User u =
        userRepository
            .findByEmailIgnoreCase(req.getEmail().trim().toLowerCase())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (!passwordEncoder.matches(req.getPassword(), u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    return toLoginResponse(u);
  }

  private static LoginResponse toLoginResponse(User u) {
    String id = String.valueOf(u.getId());
    String token = "sm-" + id;
    LoginResponse lr = new LoginResponse(token, "refresh-" + token, id);
    lr.setUsername(u.getUsername());
    lr.setDisplayName(u.getDisplayName());
    return lr;
  }
}
