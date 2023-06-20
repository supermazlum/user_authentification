import mongoose, { Post, User } from "../model/index.js";

import data from "./seed_data.json" assert { type: "json" };

await mongoose.connection.dropDatabase();

const authors = data.blogPosts.map((article) => article.author);
const uniqueAuthors = [...new Set(authors)];

const userCreationPromiseArray = uniqueAuthors.map((author) => {
  const email = author.split(" ").join(".") + "@gmail.com";
  const password = email;
  const user = new User({ name: author, email: email });
  user.setPassword(password.toLocaleLowerCase());

  return user.save();
});

await Promise.all(userCreationPromiseArray);

for (let postData of data.blogPosts) {
  // Neuer Post
  let post = new Post({ title: postData.title, content: postData.content });
  // Finde Author
  const author = await User.findOne({ name: postData.author });
  // Weise den author dem post zu
  post.author = author;
  // Post speicher (upload DB)
  post = await post.save();
  // Füge den post der User.posts property hinzu
  author.posts.push(post);
  // Änderungen am author speichern (upload db)
  await author.save();
}

// const user = await User.find().populate("posts");
// console.log(JSON.stringify(user, null, 4));
const noah = await User.findOne({ email: "noah.miller@gmail.com" });
const loginPassword = "noah.miller@gmail.com";

const isPasswordValid = noah.verifyPassword(loginPassword);
console.log({ loginPassword, isPasswordValid });
