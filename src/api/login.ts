async function Login(email: string, password: string) {
  const apiKey = "AIzaSyC90iTlSGZX82lWufq9yVnSOWDRnpGuYus";
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const user = await response.json();

  if (response.ok) {
    return user;
  } else {
    throw new Error(user.error.message);
  }
}

export default Login;
