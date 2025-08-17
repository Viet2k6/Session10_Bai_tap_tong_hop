"use strict";
class Passenger {
    constructor(name, passportNumber) {
        this.passengerId = Passenger.nextId++;
        this.name = name;
        this.passportNumber = passportNumber;
    }
    getDetails() {
        return `ID: ${this.passengerId}, Name: ${this.name}, Passport: ${this.passportNumber}`;
    }
}
Passenger.nextId = 1;
class Flight {
    constructor(flightNumber, origin, destination, departureTime, capacity) {
        this.flightNumber = flightNumber;
        this.origin = origin;
        this.destination = destination;
        this.departureTime = departureTime;
        this.capacity = capacity;
        this.bookedSeats = 0;
    }
    bookSeat() {
        if (!this.isFull()) {
            this.bookedSeats++;
            return true;
        }
        return false;
    }
    isFull() {
        return this.bookedSeats >= this.capacity;
    }
}
class DomesticFlight extends Flight {
    calculateBaggageFee(weight) {
        return weight * 50000;
    }
}
class InternationalFlight extends Flight {
    calculateBaggageFee(weight) {
        return weight * 10;
    }
}
class Booking {
    constructor(passenger, flight, numberOfTickets) {
        this.bookingId = Booking.nextId++;
        this.passenger = passenger;
        this.flight = flight;
        this.numberOfTickets = numberOfTickets;
        const baggageFeePerPassenger = flight.calculateBaggageFee(20);
        this.totalCost = numberOfTickets * (baggageFeePerPassenger + 1);
    }
    getBookingDetails() {
        return `Booking ${this.bookingId} | Passenger: ${this.passenger.name} | Flight: ${this.flight.flightNumber} | Tickets: ${this.numberOfTickets} | Total Cost: ${this.totalCost}`;
    }
}
Booking.nextId = 1;
class GenericRepository {
    constructor() {
        this.items = [];
    }
    add(item) {
        this.items.push(item);
    }
    getAll() {
        return [...this.items];
    }
    find(predicate) {
        return this.items.find(predicate);
    }
    findIndex(predicate) {
        return this.items.findIndex(predicate);
    }
    remove(predicate) {
        this.items = this.items.filter(item => !predicate(item));
    }
}
class AirlineManager {
    constructor() {
        this.flightRepository = new GenericRepository();
        this.passengerRepository = new GenericRepository();
        this.bookingRepository = new GenericRepository();
    }
    addFlight(flight) {
        this.flightRepository.add(flight);
    }
    addPassenger(name, passportNumber) {
        const newPassenger = new Passenger(name, passportNumber);
        this.passengerRepository.add(newPassenger);
    }
    createBooking(passengerId, flightNumber, numberOfTickets) {
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
    cancelBooking(bookingId) {
        this.bookingRepository.remove(booking => booking.bookingId === bookingId);
    }
    listAvailableFlights(origin, destination) {
        return this.flightRepository
            .getAll()
            .filter(flight => flight.origin === origin &&
            flight.destination === destination &&
            !flight.isFull());
    }
    listBookingsByPassenger(passengerId) {
        return this.bookingRepository
            .getAll()
            .filter(booking => booking.passenger.passengerId === passengerId);
    }
    calculateTotalRevenue() {
        return this.bookingRepository
            .getAll()
            .reduce((totalRevenue, booking) => totalRevenue + booking.totalCost, 0);
    }
    countFlightsByType() {
        return this.flightRepository.getAll().reduce((counts, flight) => {
            if (flight instanceof DomesticFlight) {
                counts.domestic++;
            }
            else if (flight instanceof InternationalFlight) {
                counts.international++;
            }
            return counts;
        }, { domestic: 0, international: 0 });
    }
}
const manager = new AirlineManager();
const printMenu = () => {
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
8. Đếm số lượng chuyến bay nội địa/quốc tế
11. Thoát chương trình
Nhập lựa chọn của bạn:`);
        const choice = Number(choiceInput);
        if (!isNaN(choice) && choice >= 1 && choice <= 11) {
            return choice;
        }
        else {
            alert("Nhập số không hợp lệ.");
        }
    }
};
const main = () => {
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
                    let flight;
                    if (type === 1) {
                        flight = new DomesticFlight(flightNumber, origin, destination, departureTime, capacity);
                    }
                    else {
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
                    }
                    else {
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
                    }
                    else {
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
                    }
                    else {
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
            case 8: {
                const counts = manager.countFlightsByType();
                alert(`Số lượng chuyến bay:\nNội địa: ${counts.domestic}\nQuốc tế: ${counts.international}`);
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
