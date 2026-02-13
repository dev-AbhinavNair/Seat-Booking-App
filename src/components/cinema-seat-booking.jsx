//rafce to write boiler code

import React, { useEffect, useMemo, useState } from 'react'

const CinemaSeatBooking = ({
    layout = {
        rows: 8,
        seatsPerRow:12,
        aislePosition:5
    },
    seatTypes = {
        regular: {name: "Regular", price: 150, rows: [0, 1, 2]},
        premium: {name: "Premium", price: 250, rows: [3, 4, 5]},
        vip: {name: "VIP", price: 350, rows: [6, 7]}
    },
    bookedSeats = [],
    currency = "₹",
    onBookingComplete = () => {},
    title = "Cinema Hall Booking",
    subTitle = "Select your seats"
}) => {

    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const getBookedSeatsForDate = (date) => {
        const storedBookings = localStorage.getItem('cinemaBookings');
        if (!storedBookings) return [];
        
        const bookings = JSON.parse(storedBookings);
        return bookings[date] || [];
    };

    const getAllBookingsWithDates = () => {
        const storedBookings = localStorage.getItem('cinemaBookings');
        if (!storedBookings) return {};
        
        return JSON.parse(storedBookings);
    };

    const cancelBooking = (date, seatIds) => {
        const confirmed = window.confirm('Are you sure you want to cancel this booking?');
        if (!confirmed) return;

        const bookings = getAllBookingsWithDates();
        
        if (bookings[date]) {
            bookings[date] = bookings[date].filter(seat => !seatIds.includes(seat.id));
            
            if (bookings[date].length === 0) {
                delete bookings[date];
            }
            
            localStorage.setItem('cinemaBookings', JSON.stringify(bookings));
            
            const updatedBookings = getAllBookingsWithDates();
            setAllBookings(updatedBookings);
            
            const bookedSeatsForDate = getBookedSeatsForDate(selectedDate);
            const bookedSeatIds = bookedSeatsForDate.map(seat => seat.id);
            
            setSeats(prevSeats => 
                prevSeats.map((row) => 
                    row.map((seat) => ({
                        ...seat,
                        status: bookedSeatIds.includes(seat.id) ? "booked" : "available"
                    }))
                )
            );
            
            if (bookings[date] && bookings[date].length === 0) {
                const remainingDates = Object.keys(updatedBookings).sort();
                setActiveTab(remainingDates[0] || null);
            }
        }
    };

    const formatDisplayDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const colors = [
        "blue",
        "purple",
        "yellow",
        "green", 
        "red",
        "indigo",
        "pink",
        "gray",
    ]

    const getSeatType = (row) => {
        const seatTypeEntries = Object.entries(seatTypes);

        for(let i=0; i < seatTypeEntries.length; i++) {
            const [type, config] = seatTypeEntries[i];

            if(config.rows.includes(row)) {

                const color = colors[i % colors.length];
                return {type, color, ...config};

            }
        }
    };

    const initializeSeats = useMemo(() => {
        const bookedSeatsForDate = getBookedSeatsForDate(selectedDate);
        const bookedSeatIds = bookedSeatsForDate.map(seat => seat.id);

        const seats = [];

        for(let row=0; row < layout.rows; row++) {
            const seatRow = [];
            const seatTypeInfo = getSeatType(row);

            for(let seat=0; seat < layout.seatsPerRow; seat++) {
                const seatId = `${String.fromCharCode(65 + row)}${seat+1}`;

                seatRow.push({
                    id: seatId,
                    row,
                    seat,
                    type: seatTypeInfo?.type || "regular",
                    price: seatTypeInfo?.price || 150,
                    color: seatTypeInfo?.color || "blue",
                    status: bookedSeatIds.includes(seatId) ? "booked":"available",
                    selected: false,
                });
            }
            seats.push(seatRow);    
        }
        return seats;

    },[layout, seatTypes, selectedDate]);

    const [seats, setSeats] = useState(initializeSeats);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [allBookings, setAllBookings] = useState({});

    const getColorClass = (colorName) => {
        const colorMap = {
            blue: "bg-blue-500 border-blue-300 text-white hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-400/50",
            purple: "bg-purple-500 border-purple-300 text-white hover:bg-purple-400 hover:shadow-lg hover:shadow-purple-400/50",
            yellow: "bg-yellow-500 border-yellow-300 text-white hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-400/50",
            green: "bg-green-500 border-green-300 text-white hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50",
            red: "bg-red-500 border-red-300 text-white hover:bg-red-400 hover:shadow-lg hover:shadow-red-400/50",
            indigo: "bg-indigo-500 border-indigo-300 text-white hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-400/50",
            pink: "bg-pink-500 border-pink-300 text-white hover:bg-pink-400 hover:shadow-lg hover:shadow-pink-400/50",
            gray: "bg-gray-500 border-gray-300 text-white hover:bg-gray-400 hover:shadow-lg hover:shadow-gray-400/50"
        }

        return colorMap[colorName] || colorMap.blue;
    }

    const getSeatClassName = (seat) => {
        const baseClass =  "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 m-1 border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs sm:text-sm font-bold bg-blue-100 border-blue-300 text-blue-800"

        if(seat.status === "booked") {
            return `${baseClass} bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed`;
        }

        if(seat.selected) {
            return `${baseClass} bg-green-500 border-green-600 text-white transform scale-110`;
        }

        return `${baseClass} ${getColorClass(seat.color)}`
    }

    const handleSeatClick = (rowIndex, seatIndex) => {
        const seat = seats[rowIndex][seatIndex];
        if(seat.status === "booked") return;

        const isCurrentlySelected = seat.selected;

        setSeats((prevSeats) => {
            return prevSeats.map((row, rIdx) => row.map((s, sIdx) => {
                if(rIdx === rowIndex && sIdx === seatIndex) {
                    return {...s, selected: !s.selected};
                }
                return s;
            }));
        });

        if(isCurrentlySelected) {
            setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
        }
        else {
            setSelectedSeats((prev) => [...prev, seat]);
        }
    };

    const renderSeatSection = (seatRow, startIndex, endIndex) => {

        return (
        <div className='flex'>
            {seatRow.slice(startIndex, endIndex).map((seat, index) => {
                return (
                <div className={getSeatClassName(seat)} 
                key={seat.id} 
                onClick={() => handleSeatClick(seat.row, startIndex + index)}> 
                    {startIndex + index + 1}
                </div>)
            })}
        </div>)
    }

    const uniqueSeatTypes = Object.entries(seatTypes).map(([type,config], index) => {

        return {
            type, 
            color: colors[index % colors.length],
            ...config,
        }

    })

    const getTotalPrice = () => {
        return selectedSeats.reduce((total, seat) => total + seat.price, 0);
    };

    const handleBooking = () => {
        if(selectedSeats.length === 0) {
            alert(`Select at least one seat and then proceed with booking.`);
            return;
        }

        const existingBookings = localStorage.getItem('cinemaBookings');
        const bookings = existingBookings ? JSON.parse(existingBookings) : {};
        
        if (!bookings[selectedDate]) {
            bookings[selectedDate] = [];
        }
        
        bookings[selectedDate] = [...bookings[selectedDate], ...selectedSeats];
        localStorage.setItem('cinemaBookings', JSON.stringify(bookings));

        setSeats((prevSeats) => {
            return prevSeats.map((row) => row.map((seat) => {
                if(selectedSeats.some((selected) => selected.id === seat.id)) {
                    return {...seat, status: "booked", selected: false};
                }
                return seat;
            }));
        });

        onBookingComplete({
            seat: selectedSeats,
            totalPrice: getTotalPrice(),
            seatIds: selectedSeats.map((seat) => seat.id),
        });

        alert(
            `Booking Successful!: ${selectedSeats.length} seat(s) for ${currency}${getTotalPrice()}`
        );

        setSelectedSeats([]);
        
        const updatedBookings = getAllBookingsWithDates();
        setAllBookings(updatedBookings);
        
        const bookingDates = Object.keys(updatedBookings).sort();
        if (bookingDates.length > 0 && !activeTab) {
            setActiveTab(bookingDates[0]);
        }
    } 

    useEffect(() => {
    setSelectedSeats([]);
    setSeats(initializeSeats);
}, [selectedDate, initializeSeats]);

    useEffect(() => {
        const bookings = getAllBookingsWithDates();
        setAllBookings(bookings);
        const bookingDates = Object.keys(bookings).sort();
        if (!activeTab && bookingDates.length > 0) {
            setActiveTab(bookingDates[0]);
        }
    }, [selectedDate]);




  return (
    <div className='w-full min-h-screen bg-gray-900 p-4'>


        <div className='max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6'>

            {/* title */}
            <h1 className='text-2xl lg:text-3xl font-bold text-center mb-2 text-gray-100'>{title}</h1>
            <p className='text-center text-gray-300 mb-6 text-2xl'>{subTitle}</p>

            {/* Date Picker */}
            <div className='mb-6 flex flex-col items-center'>
                <label htmlFor='date-picker' className='block text-sm font-medium text-gray-300 mb-2'>
                    Select Booking Date
                </label>
                <input
                    type='date'
                    id='date-picker'
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className='px-4 py-2 border border-gray-600 bg-gray-700 text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
                <p className='mt-2 text-sm text-gray-400'>
                    Bookings for: {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </p>
            </div>
        
        
            {/* screen */}
            <div className='mb-8'>
                <div className='w-full h-4 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-lg mb-2 shadow-inner'/>
                    <p className='text-center text-sm text-gray-400 font-medium'
                    >SCREEN</p>
            </div>

            {/* seat map */}

            <div className='mb-6 overflow-x-auto'>
                <div className='flex flex-col items-center min-w-max'>{seats.map((row, rowIndex) => {
                    return (
                        <div key={rowIndex} className='flex items-center mb-2'>
                            <span className='w-8 text-center font-bold text-gray-400 mr-4'>
                                {String.fromCharCode(65+rowIndex)}
                            </span>
                            {renderSeatSection(row, 0, layout.aislePosition)}

                            {/* asile */}
                            <div className='w-8'></div>

                            {renderSeatSection(row, layout.aislePosition, layout.seatsPerRow)}
                            </div>
                    )
                })}
                </div>
            </div>

            {/* legend */}
                
            <div className='flex flex-wrap justify-center gap-6 mb-6 p-4 bg-gray-700 rounded-lg'>
                {uniqueSeatTypes.map((seatType) => {

                    return (
                    <div key={seatType.type} className='flex items-center'>
                        <div className={`w-6 h-6 border-2 rounded-t-lg mr-2 flex items-center justify-center text-xs font-bold ${getColorClass(seatType.color) || "bg-blue-500 border-blue-300 text-white"}`}>S</div>
                        <span className='text-sm text-gray-300'>
                            {seatType.name} ({currency}
                            {seatType.price})
                        </span>
                    </div>
                    );
                })}

                <div className='flex items-center'>
                    <div className='w-6 h-6 bg-green-500 border-2 border-green-600 rounded-t-lg mr-2'></div>
                    <span className='text-sm text-gray-300'>Selected</span>
                </div>
                <div className='flex items-center'>
                    <div className='w-6 h-6 bg-gray-400 border-2 border-green-500 rounded-t-lg mr-2'></div>
                    <span className='text-sm text-gray-300'>Booked</span>
                </div>
            </div>

            {/* summary */}

            <div className='bg-gray-700 rounded-lg p-4 mb-4'>
                <h3 className='font-bold text-lg mb-2 text-gray-100'>Booking Summary</h3>
                {selectedSeats.length > 0 ? (
                    <div>
                        <p className='mb-2 text-gray-300'>
                        Selected Seats: {' '}
                        <span className='font-medium '>
                        {selectedSeats.map((s) => s.id).join(", ")}
                        </span>
                        </p>
                        <p className='mb-2 text-gray-300'>
                            Number of Seats: {' '}
                            <span className='font-medium'>{selectedSeats.length}</span>
                        </p>
                        {/* <p className='text-xl font-bold text-green-600'>
                            Total: {currency}
                            {getTotalPrice()}
                        </p> */}
                    </div>
                ): (
                    <p className='text-gray-400'>No Seats Selected</p>
                )}
            </div>


            {/* book button */}
            
            <button onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                selectedSeats.length > 0 ? 
                "bg-green-500 hover:bg-green-600 text-white transform hover:scale-102"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            >
                {selectedSeats.length > 0 ? 
                    `Book ${selectedSeats.length} Seat(s) - ${currency}${getTotalPrice()}`
                    : "Select Seats to Book"    
                }
            </button>

            {/* Booking List Section */}
            <div className='mt-8 border-t border-gray-600 pt-6'>
                <h2 className='text-xl font-bold text-center mb-6 text-gray-100'>All Bookings</h2>
                
                {Object.keys(allBookings).length > 0 ? (
                    <div>
                        {/* Date Tabs */}
                        <div className='flex flex-wrap justify-center gap-2 mb-6'>
                            {Object.keys(allBookings).sort().map((date) => (
                                <button
                                    key={date}
                                    onClick={() => setActiveTab(date)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        activeTab === date
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                >
                                    {formatDisplayDate(date)}
                                </button>
                            ))}
                        </div>

                        {/* Bookings for Active Tab */}
                        {activeTab && allBookings[activeTab] && (
                            <div className='space-y-4'>
                                {allBookings[activeTab].map((seat) => (
                                    <div
                                        key={seat.id}
                                        className='bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200'
                                    >
                                        <div className='flex justify-between items-center'>
                                            <div className='flex items-center gap-4'>
                                                <span className={`px-3 py-1 rounded font-bold text-sm ${getColorClass(seat.color)}`}>
                                                    {seat.id}
                                                </span>
                                                <span className='text-gray-400'>
                                                    {seat.type.charAt(0).toUpperCase() + seat.type.slice(1)}
                                                </span>
                                                <span className='text-lg font-bold text-green-600'>
                                                    {currency}{seat.price}
                                                </span>
                                            </div>
                                            
                                            <button
                                                onClick={() => cancelBooking(activeTab, [seat.id])}
                                                className='px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors duration-200'
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='text-center py-8 text-gray-400'>
                        No bookings available. Make your first booking above!
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CinemaSeatBooking;