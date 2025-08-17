class Passenger {
  static nextId: number = 1;
  passengerId: number;
  name: string;
  passportNumber: string;
  constructor(name: string, passportNumber: string) {
    this.passengerId = Passenger.nextId++;
    this.name = name;
    this.passportNumber = passportNumber;
  }
  getDetails(): string {
    return `ID: ${this.passengerId}, Name: ${this.name}, Passport: ${this.passportNumber}`;
  }
}

abstract class Flight {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  capacity: number;
  bookedSeats: number;
  constructor(flightNumber: string, origin: string, destination: string, departureTime: Date, capacity: number) {
    this.flightNumber = flightNumber;
    this.origin = origin;
    this.destination = destination;
    this.departureTime = departureTime;
    this.capacity = capacity;
    this.bookedSeats = 0;
  }
  bookSeat(): boolean {
    if (!this.isFull()) {
      this.bookedSeats++;
      return true;
    }
    return false;
  }
  isFull(): boolean {
    return this.bookedSeats >= this.capacity;
  }
  abstract calculateBaggageFee(weight: number): number;
}

class DomesticFlight extends Flight {
  calculateBaggageFee(weight: number): number {
    return weight * 50000; 
  }
}

class InternationalFlight extends Flight {
  calculateBaggageFee(weight: number): number {
    return weight * 10; 
  }
}

class Booking {
  static nextId: number = 1;
  bookingId: number;
  passenger: Passenger;
  flight: Flight;
  numberOfTickets: number;
  totalCost: number;
  constructor(passenger: Passenger, flight: Flight, numberOfTickets: number) {
    this.bookingId = Booking.nextId++;
    this.passenger = passenger;
    this.flight = flight;
    this.numberOfTickets = numberOfTickets;
    const baggageFeePerPassenger = flight.calculateBaggageFee(20);
    this.totalCost = numberOfTickets * (baggageFeePerPassenger + 1); 
  }
  getBookingDetails(): string {
    return `Booking ${this.bookingId} | Passenger: ${this.passenger.name} | Flight: ${this.flight.flightNumber} | Tickets: ${this.numberOfTickets} | Total Cost: ${this.totalCost}`;
  }
}

class GenericRepository<T> {
  private items: T[] = [];
  add(item: T): void {
    this.items.push(item);
  }
  getAll(): T[] {
    return [...this.items];
  }
  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }
  findIndex(predicate: (item: T) => boolean): number {
    return this.items.findIndex(predicate);
  }
  remove(predicate: (item: T) => boolean): void {
    this.items = this.items.filter(item => !predicate(item));
  }
}

class AirlineManager {
  private flightRepository = new GenericRepository<Flight>();
  private passengerRepository = new GenericRepository<Passenger>();
  private bookingRepository = new GenericRepository<Booking>();
  addFlight(flight: Flight): void {
    this.flightRepository.add(flight);
  }
  addPassenger(name: string, passportNumber: string): void {
    const newPassenger = new Passenger(name, passportNumber);
    this.passengerRepository.add(newPassenger);
  }
  createBooking(passengerId: number, flightNumber: string, numberOfTickets: number): Booking | null {
    const passenger = this.passengerRepository.find(passenger => passenger.passengerId === passengerId);
    const flight = this.flightRepository.find(flight => flight.flightNumber === flightNumber);
    if (!passenger || !flight || flight.isFull()) {
      return null;
    }
    for (let i = 0; i < numberOfTickets; i++) {
      if (!flight.bookSeat()) {
        break;
      }
    }
    const newBooking = new Booking(passenger, flight, numberOfTickets);
    this.bookingRepository.add(newBooking);
    return newBooking;
  }
  cancelBooking(bookingId: number): void {
    this.bookingRepository.remove(booking => booking.bookingId === bookingId);
  }
  listAvailableFlights(origin: string, destination: string): Flight[] {
    return this.flightRepository
      .getAll()
      .filter(flight =>
        flight.origin === origin &&
        flight.destination === destination &&
        !flight.isFull()
      );
  }
  listBookingsByPassenger(passengerId: number): Booking[] {
    return this.bookingRepository
      .getAll()
      .filter(booking => booking.passenger.passengerId === passengerId);
  }
  calculateTotalRevenue(): number {
    return this.bookingRepository
      .getAll()
      .reduce((totalRevenue, booking) => totalRevenue + booking.totalCost, 0);
  }
}


const manager = new AirlineManager();
const printMenu = (): number => {
  while (true) {
    const choiceInput = prompt(`
===== MENU QUẢN LÝ HÃNG HÀNG KHÔNG =====
1. Thêm hành khách mới
2. Thêm chuyến bay mới
3. Tạo giao dịch đặt vé
4. Hủy giao dịch đặt vé
5. Hiển thị danh sách chuyến bay còn trống
6. Hiển thị danh sách vé đã đặt của một hành khách
7. Tính tổng doanh thu của hãng
11. Thoát chương trình
Nhập lựa chọn của bạn:`);
    const choice = Number(choiceInput);
    if (!isNaN(choice) && choice >= 1 && choice <= 11) {
      return choice;
    } else {
      alert("Nhập số không hợp lệ.");
    }
  }
};

const main = (): void => {
  let running = true;
  while (running) {
    const choice = printMenu();
    switch (choice) {
      case 1: {
        const name = prompt("Nhập tên hành khách:");
        const passport = prompt("Nhập số hộ chiếu:");
        if (name && passport) {
          manager.addPassenger(name, passport);
          alert("Đã thêm hành khách mới.");
        }
        break;
      }
      case 2: {
        const typeInput = prompt("Chọn loại chuyến bay (1: Nội địa, 2: Quốc tế):");
        const type = Number(typeInput);
        const flightNumber = prompt("Nhập số hiệu chuyến bay:");
        const origin = prompt("Nhập điểm đi:");
        const destination = prompt("Nhập điểm đến:");
        const timeStr = prompt("Nhập ngày giờ khởi hành (YYYY-MM-DD HH:mm):");
        const capacityStr = prompt("Nhập sức chứa:");
        if (flightNumber && origin && destination && timeStr && capacityStr) {
          const departureTime = new Date(timeStr);
          const capacity = parseInt(capacityStr);
          let flight: Flight;
          if (type === 1) {
            flight = new DomesticFlight(flightNumber, origin, destination, departureTime, capacity);
          } else {
            flight = new InternationalFlight(flightNumber, origin, destination, departureTime, capacity);
          }
          manager.addFlight(flight);
          alert("Đã thêm chuyến bay mới.");
        }
        break;
      }
      case 3: {
        const passengerIdStr = prompt("Nhập ID hành khách:");
        const flightNumber = prompt("Nhập số hiệu chuyến bay:");
        const ticketStr = prompt("Nhập số lượng vé:");
        if (passengerIdStr && flightNumber && ticketStr) {
          const passengerId = parseInt(passengerIdStr);
          const tickets = parseInt(ticketStr);
          const booking = manager.createBooking(passengerId, flightNumber, tickets);
          if (booking) {
            alert("Đặt vé thành công!\n" + booking.getBookingDetails());
          } else {
            alert("Đặt vé thất bại.");
          }
        }
        break;
      }
      case 4: {
        const bookingIdStr = prompt("Nhập ID giao dịch đặt vé muốn hủy:");
        if (bookingIdStr) {
          const bookingId = parseInt(bookingIdStr);
          manager.cancelBooking(bookingId);
          alert("Đã hủy giao dịch đặt vé.");
        }
        break;
      }
        case 5: {
        const origin = prompt("Nhập điểm đi:");
        const destination = prompt("Nhập điểm đến:");
        if (origin && destination) {
          const availableFlights = manager.listAvailableFlights(origin, destination);
          if (availableFlights.length === 0) {
            alert("Không có chuyến bay nào còn trống.");
          } else {
            let result = "";
            availableFlights.forEach(f => {
              result += `Chuyến ${f.flightNumber} | ${f.origin} → ${f.destination} | Còn ${f.capacity - f.bookedSeats} chỗ\n`;
            });
            alert(result);
          }
        }
        break;
      }
      case 6: {
        const passengerIdStr = prompt("Nhập ID hành khách:");
        if (passengerIdStr) {
          const passengerId = parseInt(passengerIdStr);
          const bookings = manager.listBookingsByPassenger(passengerId);
          if (bookings.length === 0) {
            alert("Hành khách chưa có vé nào.");
          } else {
            let result = "Danh sách vé đã đặt:\n";
            bookings.forEach(b => {
              result += b.getBookingDetails() + "\n";
            });
            alert(result);
          }
        }
        break;
      }
      case 7: {
        const revenue = manager.calculateTotalRevenue();
        alert(`Tổng doanh thu của hãng: ${revenue}`);
        break;
      }
      case 11: {
        alert("Thoát chương trình.");
        return;
      }
    }
  }
};
main();
