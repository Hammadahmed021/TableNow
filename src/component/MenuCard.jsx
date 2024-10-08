import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const MenuCard = ({
  image,
  fallbackText,
  name,
  detail,
  duration,
  price,
  type,
  extraDetails = [],
  isOpen,
  onToggle
}) => {
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef(null);

  const handleError = () => {
    setImgError(true);
  };

  return (
    <div className="w-full" ref={cardRef}>
      <div className="max-w-xl w-full sm:w-[100%] rounded-xl flex mb-4 sm:mb-6 bg-tn_light relative flex-col">
        <div className="flex relative rounded-xl">
          <div className="sm:w-1/2 w-3/12 overflow-hidden rounded-xl">
            {!imgError ? (
              <img
                className="w-full h-[300px] object-cover"
                src={image}
                alt={name}
                onError={handleError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-l-lg">
                <span className="text-tn_text_grey">{fallbackText}</span>
              </div>
            )}
          </div>
          <div className="sm:px-6 sm:py-4 p-3 flex flex-col justify-between sm:w-1/2 w-9/12 overflow-hidden">
            <p className="font-medium text-md mb-2">{type}</p>
            <div>
              <h4 className="font-bold text-xl mb-2 ellipsis">{name}</h4>
              <p className="text-sm text-tn_text_grey opacity-70 ellipsis">
                {detail}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm">{duration}</p>
              <p className="text-base sm:text-lg font-bold">Dkk {price}</p>
            </div>
          </div>
          {/* Plus/Minus Icon */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 cursor-pointer">
            <div
              className="bg-tn_pink p-2 text-white rounded-full shadow-lg flex items-center justify-center z-10"
              onClick={onToggle}
            >
              {isOpen ? <FaMinus size={14} /> : <FaPlus size={14} />}
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="w-full px-4 py-2 mt-2 bg-tn_light rounded-xl">
            {extraDetails.length > 0 ? (
              extraDetails.map((detail, index) => (
                <div key={index} className="mb-3">
                  <h5 className="font-bold text-base capitalize">
                    {detail.title}
                  </h5>
                  <p className="text-sm text-tn_text_grey capitalize">
                    {detail.description}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-tn_text_grey">
                No additional details available.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
