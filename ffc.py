class Car:
    # def __init__(self, color, company) -> None:
    #     self.c = color
    #     self.co = company

    def working(self, c, co):
        print(c)
        print(co)



car1 = Car().working("Red", "honda")

class Student:
    id = 0

    def __init__(self) -> None:
        self.id += 1
    def show(self):
        print(self.id)
    
    

aman = Student()
aman.show()
aman.id = 5
aman.show()
Student.id = 6
aman.show()
