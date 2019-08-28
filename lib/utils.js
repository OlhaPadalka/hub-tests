module.exports = {
  generateID: length => {
    let result = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLeght = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLeght));
    }
    return result;
  },

  generateEmail: () => {
    let values = "abcdefghijklmnopqrstuvwxyz0123456789";
    let email = "";
    let temp;
    for (let i = 0; i < 10; i++) {
      temp = values.charAt(Math.round((values.length = Math.random())));
      email += temp;
    }
    temp = "";
    email += "@";
    for (let i = 0; i < 8; i++) {
      temp = values.charAt(Math.round((values.length = Math.random())));
      email += temp;
    }
    email += ".com";
    return email;
  },

  generateNumbers: () => {
    let numbers = math.floor(Math.random() * 9000000000) + 100000000;
    return numbers.toString();
  }
};
