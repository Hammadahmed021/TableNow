import React, { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const SkeletonLoader = () => {
  return (
    <div className="w-full h-48 bg-gray-300 rounded-2xl animate-pulse mb-4"></div>
  );
};

const Gallery = ({ images, address, restaurant_name, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const handleOpenLightbox = (index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  const toggleImages = () => {
    setShowAll(!showAll);
  };

  const totalImagesCount = showAll ? Math.min(3, images.length) : images.length;

  return (
    <div className="text-center pt-8 sm:pt-10 pb-6 relative">
      <div className="flex flex-wrap items-start justify-between mb-8 sm:mb-6">
        <div className="">
          <p className="text-gray-700 text-base text-start">{address}</p>
          <h1 className="text-start text-3xl font-extrabold capitalize mb-4 sm:mb-0">{restaurant_name}</h1>
        </div>

        <button
          className="px-4 py-2 bg-tn_dark text-white rounded-full text-md sm:text-lg block sm:inline-block w-full sm:w-auto"
          onClick={toggleImages}
        >
          {showAll ? "Show Less" : "Show All"} ({totalImagesCount}) Images
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-gray-500 text-lg">No images to show</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: showAll ? 6 : 3 }, (_, index) => (
                <SkeletonLoader key={index} />
              ))
            : images.slice(0, 3).map((image, index) => (
                <div key={index}>
                  <img
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full sm:h-64 object-cover cursor-pointer rounded-2xl h-auto"
                    onClick={() => handleOpenLightbox(index)}
                  />
                </div>
              ))}
          {showAll &&
            !loading &&
            images.slice(3).map((image, index) => (
              <div key={index}>
                <img
                  src={image}
                  alt={`Image ${index + 4}`}
                  className="w-full sm:h-64 object-cover cursor-pointer rounded-2xl h-auto"
                  onClick={() => handleOpenLightbox(index + 3)}
                />
              </div>
            ))}
        </div>
      )}

      {isOpen && (
        <Lightbox
          slides={images.map((image) => ({ src: image }))}
          open={isOpen}
          index={photoIndex}
          close={() => setIsOpen(false)}
          onIndexChange={(index) => setPhotoIndex(index)}
        />
      )}
    </div>
  );
};

export default Gallery;
