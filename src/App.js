import { useState, useEffect } from "react";
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast, { Toaster } from 'react-hot-toast'

function App() {
  const [weather, setWeather] = useState('');
  const [cityname, setCityname] = useState('');
  const [weatherData, setWeatherData] = useState([]);

  const formik = useFormik({
    initialValues: { city: "" },
    validationSchema: Yup.object({
      city: Yup.string().required("City is required")
        .test("no-numbers", "City should not contain numbers!!", value => {
          return /^[A-Za-z\s]+$/.test(value);
        })
    }),
    onSubmit: async (values) => {
      try {
        const cities = values.city.split(",").map((city) => city.trim());
        const weatherDataPromises = cities.map((city) =>
          axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.REACT_APP_API_KEY}&units=metric`
          )
        );

        const responses = await Promise.all(weatherDataPromises);
        const weatherDataList = responses.map((response) => response.data);

        setWeatherData(weatherDataList);
        formik.resetForm();
      } catch (err) {
        if (err.response && err.response.status === 404) {
          toast.error("City not found!");
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    }
  });

  const fetchCurrentCity = async (lat, lon) => {
    try {
    
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_API_KEY}&units=metric`)
      setWeather(response.data);
    }
    catch (err) {
      toast.error('Internal Server Error. Please try again');
    }
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetchCurrentCity(latitude, longitude);
    })
  }, []);

  return (
    <>
      <div className=" bg-center bg-no-repeat bg-cover h-screen" style={{ backgroundImage: "url('./bgImage.jpg')" }}>
        <div className='flex flex-col items-center'>
          <h1 className='py-4 text-4xl text-white font-sans font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]'>Search Weather</h1>
          <form onSubmit={formik.handleSubmit}>
            <input
              type="text"
              placeholder="Enter city names separated by commas"
              className="px-8 py-5 rounded-l-md"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              id="city"
              name="city"
            />
            <button
              type='submit'
              className='px-5 py-5 bg-gradient-to-r from-sky-300 to-indigo-400 rounded-r-md text-blue-800 font-semibold hover:text-white bg-gray-700'
            >
              Submit
            </button>
            <div>
              {formik.touched.city && formik.errors.city && (
                <span className='text-blue-800'>{formik.errors.city}</span>
              )}
            </div>
          </form>
          <Toaster />
          {weatherData.map((data, index) => (
            <div key={index} className="card bg-gray-200 text-blue-700 flex flex-col justify-center items-center w-72 h-96 mt-4 rounded-md">
              <h1 className="text-4xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                {data.name}
              </h1>
              <div>
                <img
                  id="wicon"
                  src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                  alt="weather icon"
                  className="w-24"
                />
              </div>
              <h1 className="text-2xl">{data.weather[0].main}</h1>
              <p className="text-2xl">{data.main.temp}&deg;</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
