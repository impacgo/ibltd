export const isLoggedIn = () => {
  return !!localStorage.getItem("ironboy_user");
};
