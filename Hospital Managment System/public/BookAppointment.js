
    document.getElementById("appointmentForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            date: document.getElementById("date").value,
            symptoms: document.getElementById("symptoms").value
        };

        console.log("Sending data:", formData); // Debugging line to confirm data is being prepared for submission

        fetch("/api/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => response.text())
        .then(data => {
            console.log("Server response:", data);  // Debugging line to confirm server response
            alert(data);  // Shows success or error message
            document.getElementById("appointmentForm").reset();
        })
        .catch(error => {
            console.error("Error:", error);
            alert("An error occurred while booking the appointment.");
        });
    });


        const calendarIcon = document.getElementById('calendarIcon');
        const dateInput = document.getElementById('date');

        const availableDates = ['2024-10-05', '2024-10-06', '2024-10-10']; // Example available dates
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];

        // Disable previous dates
        dateInput.setAttribute('min', formattedToday);

        calendarIcon.addEventListener('click', () => {
            const dateValue = dateInput.value;
            const selectedDate = new Date(dateValue).toISOString().split('T')[0];

            // Reset date background colors
            const allDates = document.querySelectorAll('input[type="date"]');
            allDates.forEach(input => {
                if (availableDates.includes(input.value)) {
                    input.classList.remove('highlighted');
                } else if (new Date(input.value) < today) {
                    input.classList.remove('disabled');
                }
            });

            if (availableDates.includes(selectedDate)) {
                dateInput.classList.add('highlighted'); // Highlight available date
            } else if (dateValue && new Date(dateValue) < today) {
                dateInput.classList.add('disabled'); // Mark previous dates as red
            }
        });
   

        