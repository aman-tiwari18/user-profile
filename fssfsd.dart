class User {
  static int id = 0;
  String name;
  int stand;
  int uid;

  User(this.name, this.stand, {this.uid = 0});
}

void main() {
  User user1 = User("aman", 13, uid: 0);
  user1.uid++;
  User user2 = User("am", 13, uid: 1);
  User.id++;
  User user3 = User("aan", 13);
  User.id++;
  User user4 = User("man", 13);
  User.id++;
  User user5 = User("ama", 13);
  User.id++;
  List<User> users = [user1, user2, user3, user4, user5];
  print(users[0].uid);
  print(User.id);
}
