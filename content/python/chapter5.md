# PYTHON — CHAPTER 5
## Object-Oriented Programming

> “Object-oriented programming makes code modular, reusable, and easy to scale by modeling real-world entities.”

### By the End of This Chapter, You Will Be Able To:
* Understand the concept of classes, objects, and the `__init__` constructor
* Differentiate between instance and class attributes and methods
* Use inheritance and method overriding to reuse and extend code
* Leverage polymorphism and duck typing for flexible interface design
* Implement encapsulation using public, protected, and private variables
* Use dunder / magic methods to hook into Python's built-in operations
* Define interfaces and abstract classes using the `abc` module
* Choose between composition and inheritance to build flexible systems

---

### 1. Classes and Objects — the __init__ Constructor

A class is a blueprint or template for creating objects. An object is an instance of a class. The `__init__` method is the constructor that runs automatically when a new object is initialized.

```python
class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def bark(self):
        print(f"{self.name} says Woof!")

milo = Dog("Milo", "Beagle")
print(milo.name)
milo.bark()
```

Output:
```text
Milo
Milo says Woof!
```

* **Class**: A blueprint or template for creating objects. It defines the attributes (data) and methods (behavior) that the objects will have.
* **Object**: An instance of a class. It is a concrete entity created from the blueprint, containing real values for the attributes.
* **self**: Represents the specific object instance that the method is being called on. It allows each object to access its own attributes and methods.

> [!WARNING]
> **Watch Out**
> `self` is passed implicitly by Python. When you call `milo.bark()`, Python behind the scenes translates it to `Dog.bark(milo)`. You must define `self` as the first parameter in class methods, but you never pass it explicitly when calling the method.

---

### 2. Instance vs. Class Attributes and Methods

Instance attributes belong to a specific object, while class attributes are shared by all instances of the class.

```python
class Dog:
    species = "Canine" # Class attribute

    def __init__(self, name):
        self.name = name # Instance attribute

rex = Dog("Rex")
milo = Dog("Milo")

print(rex.species, rex.name)
print(milo.species, milo.name)
```

Output:
```text
Canine Rex
Canine Milo
```

Class methods (marked with `@classmethod`) access class state via `cls`, whereas static methods (marked with `@staticmethod`) behave like normal helper functions and do not access class or instance state directly.

```python
class Dog:
    species = "Canine"
    population = 0

    def __init__(self, name):
        self.name = name
        Dog.population += 1

    @classmethod
    def get_population(cls):
        return f"Total dogs: {cls.population}"

    @staticmethod
    def is_valid_name(name):
        return len(name) >= 2 and name.isalpha()

milo = Dog("Milo")
rex = Dog("Rex")

print(Dog.get_population())
print(Dog.is_valid_name("Milo"))
print(Dog.is_valid_name("M"))
```

Output:
```text
Total dogs: 2
True
False
```

> [!NOTE]
> **Key Idea**
> Use `@classmethod` when the method needs to access or modify class-state (like tracking total population or alternative constructors). Use `@staticmethod` when the method is related to the class but doesn't need to access class (cls) or instance (self) state at all.

---

### 3. Inheritance and Method Overriding

Inheritance allows a subclass to inherit attributes and methods from a parent class. Method overriding allows a subclass to provide a specific implementation of a method that is already defined in its parent class.

```python
class Animal:
    def speak(self):
        print("...makes a sound.")

class Cat(Animal):
    def speak(self):
        print("Whiskers says Meow!")

class Fish(Animal):
    pass

cat = Cat()
fish = Fish()

cat.speak()
fish.speak()
```

Output:
```text
Whiskers says Meow!
...makes a sound.
```

Using `super()` allows you to access methods of the parent class, including the constructor.

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound."

class Cat(Animal):
    def __init__(self, name, color):
        super().__init__(name) # Reuse parent constructor
        self.color = color

    def speak(self):
        parent_sound = super().speak() # Reuse parent method logic
        return f"{parent_sound} Specifically, {self.name} says Meow!"

whiskers = Cat("Whiskers", "Orange")
print(whiskers.name)
print(whiskers.color)
print(whiskers.speak())
```

Output:
```text
Whiskers
Orange
Whiskers makes a sound. Specifically, Whiskers says Meow!
```

> [!NOTE]
> **Note**
> `super()` returns a proxy object that delegates method calls to a parent or sibling class. It is essential to use `super().__init__(...)` in a subclass's constructor if the parent class requires arguments or performs necessary setup.

#### ✏ Try It Yourself
Create a subclass `Dog(Animal)` that overrides `speak()` to return `"{name} barks!"` and calls `super().__init__(name)` in its constructor.

---

### 4. Polymorphism and Duck Typing

Polymorphism allows different classes to share the same method names. In Python, duck typing means we check for behavior (methods) rather than subclass relationships.

```python
class Cat:
    def speak(self):
        return "Meow!"

class Dog:
    def speak(self):
        return "Woof!"

class Robot:
    def speak(self):
        return "Beep Boop!"

def make_it_speak(duck):
    print(duck.speak())

make_it_speak(Cat())
make_it_speak(Dog())
make_it_speak(Robot())
```

Output:
```text
Meow!
Woof!
Beep Boop!
```

> [!NOTE]
> **Key Idea**
> "Duck Typing" comes from the phrase: *"If it walks like a duck and it quacks like a duck, then it's a duck."* In Python, you don't check if an object is an instance of a specific class. You simply call the method you need. If the object has that method and behaves as expected, Python will execute it.

---

### 5. Encapsulation — Public, Protected & Private

Encapsulation restricts direct access to some of an object's components, which is useful for hiding state details.

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner        # Public attribute
        self._pin = "1234"        # Protected attribute
        self.__balance = balance  # Private attribute

    def get_balance(self):
        return self.__balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

account = BankAccount("Alice", 1000)
print(account.owner)
print(account._pin)
# print(account.__balance) # Raises AttributeError
print(account.get_balance())
```

Output:
```text
Alice
1234
1000
```

| Naming | Prefix | Description | Example |
| :--- | :--- | :--- | :--- |
| Public | None | Accessible from anywhere inside and outside the class. | `self.owner` |
| Protected | Single Underscore `_` | Intended for internal use by convention. Accessible outside, but discourages direct access. | `self._pin` |
| Private | Double Underscore `__` | Triggers name mangling. The interpreter alters the name to block direct access from outside. | `self.__balance` |

> [!WARNING]
> **Watch Out**
> Private attributes undergo "name mangling." A private attribute `__balance` inside a class `BankAccount` is renamed internally to `_BankAccount__balance`. While you can technically access it from outside using this mangled name, doing so is highly discouraged as it breaks the encapsulation contract.

> [!NOTE]
> **Real-World Use**
> In web API clients, private variables are used to hide sensitive connection states and session keys, forcing developers to interact with the API only through authorized public methods like `get()` or `post()`.

---

### 6. Dunder / Magic Methods

Dunder methods (starting and ending with double underscores) let your objects hook into Python's built-in operators and functions.

```python
class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages

    def __str__(self):
        return f"'{self.title}' by {self.author}"

    def __repr__(self):
        return f"Book('{self.title}', '{self.author}', {self.pages})"

    def __len__(self):
        return self.pages

    def __eq__(self, other):
        if isinstance(other, Book):
            return self.title == other.title and self.author == other.author
        return False

b1 = Book("Python Basics", "Guido", 200)
b2 = Book("Python Basics", "Guido", 250)

print(str(b1))
print(repr(b1))
print(len(b1))
print(b1 == b2)
```

Output:
```text
'Python Basics' by Guido
Book('Python Basics', 'Guido', 200)
200
True
```

> [!NOTE]
> **Note**
> By default, if two custom objects with identical attribute values are compared with `==` without `__eq__` implemented, Python checks their memory addresses (identity) and returns `False`. Defining `__eq__` lets you define custom value equality.

> [!NOTE]
> **Key Idea**
> `__str__` is meant to return a user-friendly string representation of the object (e.g. for printing to end users), whereas `__repr__` is intended to return an unambiguous, developer-friendly string that ideally looks like the Python code used to create the object.

---

### 7. Abstract Classes and Interfaces (abc module)

Abstract Base Classes (ABCs) enforce that subclasses implement specific methods before they can be instantiated.

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

rect = Rectangle(10, 5)
print(rect.area())
```

Output:
```text
50
```

> [!WARNING]
> **Watch Out**
> You cannot instantiate an abstract class that has unimplemented abstract methods. Attempting to run `shape = Shape()` will raise a `TypeError: Can't instantiate abstract class Shape with abstract method area`.

---

### 8. Composition vs. Inheritance

Inheritance represents an "is-a" relationship (e.g. Employee is a Person), while Composition represents a "has-a" relationship (e.g. Car has an Engine).

```python
# Inheritance: Employee IS A Person
class Person:
    def __init__(self, name):
        self.name = name

class Employee(Person):
    def __init__(self, name, role):
        super().__init__(name)
        self.role = role

# Composition: Car HAS AN Engine
class Engine:
    def start(self):
        return "Engine starting..."

class Car:
    def __init__(self, make):
        self.make = make
        self.engine = Engine() # Car has an Engine

    def drive(self):
        print(f"{self.make} is ready. {self.engine.start()}")

car = Car("Tesla")
car.drive()
```

Output:
```text
Tesla is ready. Engine starting...
```

> [!NOTE]
> **Key Idea**
> A design best practice is to *"favor object composition over class inheritance."* Composition creates looser coupling and makes classes easier to refactor, test, and change over time.

> [!NOTE]
> **Real-World Use**
> A database-backed application uses composition: a `User` class has a `DatabaseConnection` attribute rather than inheriting from `DatabaseConnection` directly.

---

### 9. Mini Project: Library Management System

This project combines custom classes, encapsulation of state attributes, dunder methods for representation, and object integration.

```python
class Book:
    def __init__(self, title, author):
        self.title = title
        self.author = author

    def __str__(self):
        return f"'{self.title}' by {self.author}"

class Library:
    def __init__(self):
        self.__books = [] # private book list

    def add_book(self, book):
        if isinstance(book, Book):
            self.__books.append(book)
            print(f"Added: {book}")

    def list_books(self):
        if not self.__books:
            print("The library is empty.")
        else:
            for book in self.__books:
                print(f"- {book}")

library = Library()
b1 = Book("1984", "George Orwell")
b2 = Book("To Kill a Mockingbird", "Harper Lee")

library.add_book(b1)
library.add_book(b2)
print("\nLibrary Inventory:")
library.list_books()
```

Output:
```text
Added: '1984' by George Orwell
Added: 'To Kill a Mockingbird' by Harper Lee

Library Inventory:
- '1984' by George Orwell
- 'To Kill a Mockingbird' by Harper Lee
```

#### ✏ Try It Yourself
Extend the `Library` class to include a `remove_book(title)` method that searches for a book by its title, removes it from the private book list if found, and returns `True` (or prints a message if not found).

---

### Chapter Summary

#### Key Takeaways
* **Classes and Objects**: Classes act as blueprints, while objects are instances of those classes initialized via the `__init__` constructor.
* **Instance vs. Class**: Instance attributes and methods belong to a specific object, while class attributes and methods (with `@classmethod`) are shared among all instances, and `@staticmethod` behaves like a regular function.
* **Inheritance**: Subclasses inherit attributes and methods from parent classes, and can override them while reusing parent logic via `super()`.
* **Polymorphism and Duck Typing**: Polymorphism allows different classes to share the same method names, and Python's duck typing checks for behavior (methods) rather than strict class inheritance.
* **Encapsulation**: Naming conventions (public, `_protected`, `__private`) indicate access levels, with private variables undergoing name mangling to discourage outside modification.
* **Dunder / Magic Methods**: Special methods like `__str__`, `__repr__`, `__eq__`, and `__len__` let custom objects hook into Python's built-in syntax (printing, operators, functions).
* **Abstract Classes & Composition**: Abstract Base Classes (ABCs) enforce interface implementation on subclasses, while composition ("has-a") is often favored over inheritance ("is-a") for flexible, decoupled design.
