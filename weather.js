document.getElementById('get-weather').addEventListener('click', () => {
    let city = document.getElementById('city-input').value;
    if (city) {
        localStorage.setItem('selectedCity', city); // Save city to localStorage
        fetchWeather(city); // Pass the city name to the function
    }
});

window.onload = () => {
    const savedCity = localStorage.getItem('selectedCity') || 'Islamabad'; // Use the saved city or default to Islamabad
    fetchWeather(savedCity); // Fetch weather for the saved or default city when the page loads
};

async function fetchWeather(city) {
    const apiKey = 'c67edbf30f42d662c593571b2addd04e'; // Replace with your actual API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === 200) {
            const temp = data.main.temp;
            const humidity = data.main.humidity;
            const pressure = data.main.pressure;
            const condition = data.weather[0].main.toLowerCase();

            // Display the weather details
            displayWeatherDetails(temp, humidity, pressure, condition);
            // Change the background based on the weather condition
            updateBackground(condition);
            // Render charts
            renderCharts(temp, humidity, pressure);
        } else {
            alert('City not found. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function displayWeatherDetails(temp, humidity, pressure, condition) {
    const weatherDetails = document.getElementById('weather-details');
    weatherDetails.innerHTML = `
        <p><strong>Temperature:</strong> ${temp}°C</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Pressure:</strong> ${pressure} hPa</p>
        <p><strong>Condition:</strong> ${condition.charAt(0).toUpperCase() + condition.slice(1)}</p>
    `;
}

function updateBackground(condition) {
    const body = document.body;
    body.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy'); // Remove all weather classes
    if (condition.includes('cloud')) {
        body.classList.add('weather-cloudy');
    } else if (condition.includes('rain')) {
        body.classList.add('weather-rainy');
    } else if (condition.includes('sun')) {
        body.classList.add('weather-sunny');
    } else {
        body.style.backgroundImage = 'url("default-weather.jpg")'; // Default background
    }
}

let tempBarChart, doughnutChart, tempLineChart; // Global chart instances

function renderCharts(temp, humidity, pressure) {
    const tempBarCtx = document.getElementById('temp-bar-chart').getContext('2d');
    const doughnutCtx = document.getElementById('weather-doughnut-chart').getContext('2d');
    const tempLineCtx = document.getElementById('temp-line-chart').getContext('2d');
    // Destroy existing charts if they exist
    if (tempBarChart) {
        tempBarChart.destroy();
    }
    if (doughnutChart) {
        doughnutChart.destroy();
    }
    if (tempLineChart) {
        tempLineChart.destroy();
    }
    // Temperature Bar Chart
    tempBarChart = new Chart(tempBarCtx, {
        type: 'bar',
        data: {
            labels: ['Current Temperature'],
            datasets: [{
                label: 'Temperature (°C)',
                data: [temp],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    // Weather Conditions Doughnut Chart
    doughnutChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: ['Temperature', 'Humidity', 'Pressure'],
            datasets: [{
                data: [temp, humidity, pressure / 10], // Divide pressure by 10 to make it comparable
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true
        }
    });
    // Temperature Line Chart (simulated hourly data)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const simulatedTemps = hours.map(() => temp + (Math.random() - 0.5) * 5);
    tempLineChart = new Chart(tempLineCtx, {
        type: 'line',
        data: {
            labels: hours.map(h => `${h}:00`),
            datasets: [{
                label: 'Simulated Hourly Temperature (°C)',
                data: simulatedTemps,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

document.getElementById('forecast-filter').addEventListener('change', function() {
    const selectedFilter = this.value;
    fetchFiveDayForecast(selectedFilter); // Pass the selected filter to the function
});




