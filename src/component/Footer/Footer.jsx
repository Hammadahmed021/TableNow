import React, { useState } from "react";
import { Link } from "react-router-dom";
import { infoLinks, supportLinks } from "../../utils/localDB";
import { Logo, fb, instagram, twitter, youtube } from "../../assets";
import { Button, Input } from "../../component";
import { LuGlobe } from "react-icons/lu";
import { useForm } from "react-hook-form";
import axios from "axios";
import { sendNewsletter } from "../../utils/Api";
import { showErrorToast, showSuccessToast } from "../../utils/Toast";
import { Capacitor } from "@capacitor/core";

const Footer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isApp = Capacitor.isNativePlatform();

  const Form = () => {
    const {
      register,
      handleSubmit,
      watch,
      reset,
      formState: { errors },
    } = useForm();

    const handleNewsletter = async (email) => {
      setIsSubmitting(true); // Disable the button
      try {
        const response = await sendNewsletter(email);

        showSuccessToast(response.message || "Subscribed successfully!");
        reset();
      } catch (error) {
        showErrorToast("Email already exist or invalid");
        throw new Error(error.message || "unale to send newsletter");
      } finally {
        setIsSubmitting(false); // Re-enable the button after submission
      }
    };
    return (
      <>
        <form onSubmit={handleSubmit(handleNewsletter)}>
          <div className="left-inner flex flex-wrap justify-between items-center w-full sm:w-auto">
            <div className=" border-gray-200 rounded-lg sm:w-[300px] w-full">
              {/* <Input type={"email"} placeholder={"Enter your email address"} className="border rounded-lg border-tn_light_grey" /> */}
              <Input
                // mainInput={"sm:w-full w-full"}
                // label="Email"
                className="border rounded-lg border-tn_light_grey"
                placeholder="Enter your email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              children={isSubmitting ? "Subscribing..." : "Submit"}
              type="submit"
              disabled={isSubmitting}
              className={`ml-0 sm:ml-2 block w-full sm:w-auto sm:inline-block mt-2 sm:mt-0 ${
                isSubmitting ? "opacity-80" : ""
              }`}
            />
          </div>
        </form>
      </>
    );
  };

  return (
    <footer>
      <div className="border-t-2 border-b-2 border-tn_light_grey py-16 ">
        <div class="flex flex-wrap container mx-auto">
          {/* <!-- 40% Column --> */}
          <div class="w-full md:w-2/5 py-2 sm:py-4">
            <Link to={"/"}>
              <img src={Logo} alt="" className="w-64" />
            </Link>
            <p className="py-6 mr-0 sm:mr-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus
              lorem id penatibus imperdiet. Turpis egestas ultricies purus
              auctor tincidunt lacus nunc.
            </p>
            <p>Turpis egestas ultricies purus auctor tincidunt lacus nunc.</p>
          </div>

          {/* <!-- 60% Column --> */}
          <div class="w-full md:w-3/5 py-2 sm:py-4">
            {/* <!-- Nested 3 Columns --> */}
            <div class="flex flex-wrap space-x-0 md:space-x-0">
              <div class="w-full md:w-1/3 p-2 pl-0 lg:pl-12">
                <h3 class="text-lg font-extrabold mb-4">Contact</h3>
                <ul className="flex flex-col">
                  <li className="lg:text-base md:text-sm ">
                    <a href="tel:+12 345 678 000">+12 345 678 000</a>
                  </li>
                  <li className="lg:text-base md:text-sm ">
                    <a href="mailto:info@tablenow.com">info@tablenow.com</a>
                  </li>
                  <li className="mt-2 sm:mt-5  w-full sm:w-[100%] lg:text-base md:text-sm ">
                    7262 Sepulveda Blvd. Culver City, CA, 90230
                  </li>
                </ul>
              </div>
              <div class="w-full md:w-1/3 p-2 pl-0 lg:pl-12">
                <h3 class="text-lg font-extrabold mb-4">Info</h3>
                <ul className="flex flex-col">
                  {Object.entries(infoLinks).map(([name, url], index) => (
                    <li key={index} className="mb-2 lg:text-base md:text-sm ">
                      <Link
                        to={url}
                        target="_blank"
                        className="hover:underline"
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div class="w-full md:w-1/3 p-2 pl-0 lg:pl-12">
                <h3 class="text-lg font-extrabold mb-4">Support</h3>
                <ul className="flex flex-col">
                  {Object.entries(supportLinks).map(([name, url], index) => (
                    <li key={index} className="mb-2 lg:text-base md:text-sm ">
                      <Link to={url} className="hover:underline">
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap container mx-auto justify-between items-start mt-0 sm:mt-8">
          <Form />

          <ul className="flex flex-wrap justify-between space-x-4 mt-6 sm:mt-0">
            <li>
              <a href="#1">
                <img src={instagram} className="w-7 h-7  object-contain" />
              </a>
            </li>
            <li>
              <a href="#1">
                <img src={twitter} className="w-7 h-7  object-contain" />
              </a>
            </li>
            <li>
              <a href="#1">
                <img src={fb} className="w-7 h-7 object-contain" />
              </a>
            </li>
            <li>
              <a href="#1">
                <img src={youtube} className="w-7 h-7  object-contain" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom py-4 flex justify-between container mx-auto items-center">
        <p>© 2024 tablenow | All rights Reserved</p>
        {!isApp && (
          <div className="flex items-center">
            <LuGlobe size={18} />
            <p className="ml-4">ENG | USD</p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
