export const login = async (username, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === "admin" && password === "123") {
        resolve({ name: "Frederico" });
      } else {
        reject(new Error("Usuário ou senha inválidos"));
      }
    }, 1000);
  });
};