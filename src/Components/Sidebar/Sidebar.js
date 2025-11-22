import React, { useState, useEffect, useRef } from "react";
import './Sidebar.css'
import { useProductAvailable } from "../../Context/product-context"
import { useGenre } from "../../Context/genre-context";
import { useTranslation } from 'react-i18next';

function Sidebar() {
  const {
  dispatchSortedProductsList,
  productFilterOptions,
  dispatchProductFilterOptions
  } = useProductAvailable()

  const {
    fictionCategoryCheckbox,
    setFictionCategoryCheckbox,
    thrillerCategoryCheckbox, 
    setThrillerCategoryCheckbox,
    techCategoryCheckbox, 
    setTechCategoryCheckbox,
    philosophyCategoryCheckbox, 
    setPhilosophyCategoryCheckbox,
    romanceCategoryCheckbox, 
    setRomanceCategoryCheckbox,
    mangaCategoryCheckbox, 
    setMangaCategoryCheckbox, 
  } = useGenre()

  const ratingRadioBtnRef = useRef(null)

  const [sortPriceLowToHigh, setSortPriceLowToHigh ] = useState(false)
  const [sortPriceHighToLow, setSortPriceHighToLow ] = useState(false)
  
  const [includeOutOfStockCheckbox, setIncludeOutOfStockCheckbox] = useState(true);
  const [fastDeliveryOnlyCheckbox, setFastDeliveryOnlyCheckbox] = useState(false);

  const [minPriceRange, setMinPriceRange] = useState(0);
  const [maxPriceRange, setMaxPriceRange] = useState(2000000);
  const { t } = useTranslation();


  useEffect(()=>{
    // Only apply filters when user changes them, not on initial load
    console.log('Sidebar filter trigger:', productFilterOptions);
    dispatchSortedProductsList({type:"UPDATE_LIST_AS_PER_FILTERS",payload:productFilterOptions})
    if(sortPriceLowToHigh){ setSortPriceLowToHigh(true); setSortPriceHighToLow(false); dispatchSortedProductsList({type:"PRICE_LOW_TO_HIGH"}) }
    if(sortPriceHighToLow){ setSortPriceLowToHigh(false); setSortPriceHighToLow(true); dispatchSortedProductsList({type:"PRICE_HIGH_TO_LOW"}) }
  },[productFilterOptions, dispatchSortedProductsList, sortPriceLowToHigh, sortPriceHighToLow])

  // Apply filters when component mounts and products are available
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Initial filter application');
      dispatchSortedProductsList({type:"UPDATE_LIST_AS_PER_FILTERS",payload:productFilterOptions})
    }, 1000); // Wait for products to load
    
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  function clearFilters()
  {
    setMinPriceRange(0)
    setMaxPriceRange(2000000)
    setFictionCategoryCheckbox(true)
    setThrillerCategoryCheckbox(true)
    setTechCategoryCheckbox(true)
    setPhilosophyCategoryCheckbox(true)
    setRomanceCategoryCheckbox(true)
    setMangaCategoryCheckbox(true)
    ratingRadioBtnRef.current.click()
    setSortPriceLowToHigh(false) 
    setSortPriceHighToLow(false)
    setIncludeOutOfStockCheckbox(true)
    setFastDeliveryOnlyCheckbox(false)
    dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"})
    
    // Force refresh products list
    setTimeout(() => {
      const defaultFilters = {
        includeOutOfStock: true,
        onlyFastDeliveryProducts: false,
        minPrice: 0,
        maxPrice: 2000000,
        fiction: true,
        thriller: true,
        tech: true,
        philosophy: true,
        romance: true,
        manga: true,
        minRating: 1
      };
      dispatchSortedProductsList({type:"UPDATE_LIST_AS_PER_FILTERS",payload:defaultFilters})
    }, 100);
  }

  function showAllProducts() {
    // Emergency function to show all products
    console.log('🔧 Emergency: Showing all products');
    const allProductsPayload = {
      includeOutOfStock: true,
      onlyFastDeliveryProducts: false,
      minPrice: 0,
      maxPrice: 2000000,
      fiction: true,
      thriller: true,
      tech: true,
      philosophy: true,
      romance: true,
      manga: true,
      minRating: 1
    };
    dispatchProductFilterOptions({type:"RESET_DEFAULT_FILTERS"});
    dispatchSortedProductsList({type:"UPDATE_LIST_AS_PER_FILTERS",payload: allProductsPayload});
  }

  return (
    <aside className="product-page-sidebar">
      <div className="filter-clear-options">
        <p className="sidebar-filter-option">{t("filters")}</p>
        <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
          <p onClick={clearFilters} className="sidebar-clear-option text-underline">{t("clear")}</p>
          <p onClick={showAllProducts} style={{color: 'red', cursor: 'pointer', fontSize: '12px'}}>Show All (Debug)</p>
        </div>
      </div>

      <div className="price-slider">
        <p>{t("price")}</p>

        <div className="price-input">
          <div className="field">
            <span>{t("min")}</span>
            <input
              onChange={(e) => {
                setMinPriceRange(e.target.value); 
                if(maxPriceRange-e.target.value>10000)
                {
                  dispatchProductFilterOptions({type:"UPDATE_MIN_PRICE_RANGE_FILTER",minPrice:e.target.value})
                }
              }}
              type="number"
              className="input-min"
              value={minPriceRange}
              max="2000000"
            />
          </div>
          <div className="separator">-</div>
          <div className="field">
            <span>{t("max")}</span>
            <input
              onChange={(e) => {
                setMaxPriceRange(e.target.value);
                if(e.target.value-minPriceRange>10000)
                {
                  setMaxPriceRange(e.target.value); 
                  dispatchProductFilterOptions({type:"UPDATE_MAX_PRICE_RANGE_FILTER",maxPrice:e.target.value})
                }
              }}
              type="number"
              className="input-max"
              value={maxPriceRange}
              max="2000000"
            />
          </div>
        </div>

        <div className="slider">
          <div
            className="progress"
            style={{
              left: (minPriceRange / 2000000) * 100 + "%",
              right: 100 - (maxPriceRange / 2000000) * 100 + "%",
            }}
          ></div>
        </div>

        <div className="range-input">
          <input
            onChange={(e) => {
              if(maxPriceRange-e.target.value>10000)
              {
                setMinPriceRange(e.target.value); 
                dispatchProductFilterOptions({type:"UPDATE_MIN_PRICE_RANGE_FILTER",minPrice:e.target.value})
              }
            }}
            type="range"
            className="range-min"
            min="0"
            max="2000000"
            value={minPriceRange}
            step="50000"
          />
          <input
            onChange={(e) => {
              if(e.target.value-minPriceRange>10000)
              {
                setMaxPriceRange(e.target.value); 
                dispatchProductFilterOptions({type:"UPDATE_MAX_PRICE_RANGE_FILTER",maxPrice:e.target.value})
              }
            }}
            type="range"
            className="range-max"
            min="0"
            max="2000000"
            value={maxPriceRange}
            step="50000"
          />
        </div>
      </div>

      <div className="product-category">
        <p>{t("category")}</p>
        <div className="checkbox-item">
          <input
            onChange={() =>{ setFictionCategoryCheckbox(prevState=>!prevState); dispatchProductFilterOptions({type:"UPDATE_FICTION_FILTER"}) }}
            id="fiction-checkbox"
            type="checkbox"
            checked={fictionCategoryCheckbox}
          />
          <label htmlFor="fiction-checkbox">{t("fiction")}</label>
        </div>

        <div className="checkbox-item">
          <input
            onChange={() => {setThrillerCategoryCheckbox(prevState=>!prevState); dispatchProductFilterOptions({type:"UPDATE_THRILLER_FILTER"}) } }
            id="thriller-checkbox"
            type="checkbox"
            checked={thrillerCategoryCheckbox}
          />
          <label htmlFor="thriller-checkbox">{t("thriller")}</label>
        </div>

        <div className="checkbox-item">
          <input
            onChange={() => {setTechCategoryCheckbox(prevState=>!prevState); dispatchProductFilterOptions({type:"UPDATE_TECH_FILTER"}) } }
            id="tech-checkbox"
            type="checkbox"
            checked={techCategoryCheckbox}
          />
          <label htmlFor="tech-checkbox">{t("tech")}</label>
        </div>

        <div className="checkbox-item">
          <input
            onChange={() => {setPhilosophyCategoryCheckbox(prevState=>!prevState); dispatchProductFilterOptions({type:"UPDATE_PHILOSOPHY_FILTER"}) }}
            id="philosophy-checkbox"
            type="checkbox"
            checked={philosophyCategoryCheckbox}
          />
          <label htmlFor="philosophy-checkbox">{t("philosophy")}</label>
        </div>

        <div className="checkbox-item">
          <input
            onChange={() => {setRomanceCategoryCheckbox(prevState=>!prevState); dispatchProductFilterOptions({type:"UPDATE_ROMANCE_FILTER"}) } }
            id="romance-checkbox"
            type="checkbox"
            checked={romanceCategoryCheckbox}
          />
          <label htmlFor="romance-checkbox">{t("romance")}</label>
        </div>

        <div className="checkbox-item">
          <input
            onChange={() => {setMangaCategoryCheckbox(prevState=>!prevState); dispatchProductFilterOptions({type:"UPDATE_MANGA_FILTER"}) } }
            id="manga-checkbox"
            type="checkbox"
            checked={mangaCategoryCheckbox}
          />
          <label htmlFor="manga-checkbox">{t("manga")}</label>
        </div>
      </div>

      <div className="product-page-rating-radio">
        <p>{t("rating")}</p>

        <div className="rating-items">
          <input
            onChange={() => dispatchProductFilterOptions({type:"UPDATE_MINIMUM_RATING_FILTER",minRating : 4})   }
            type="radio"
            id="4-stars-or-above"
            name="rating"
            value="4-stars-or-above"
          />
          <label htmlFor="4-stars-or-above">{t("4starsAndAbove")}</label>
        </div>

        <div className="rating-items">
          <input
            onChange={() => dispatchProductFilterOptions({type:"UPDATE_MINIMUM_RATING_FILTER",minRating : 3})   }
            type="radio"
            id="3-stars-or-above"
            name="rating"
            value="3-stars-or-above"
          />
          <label htmlFor="3-stars-or-above">{t("3starsAndAbove")}</label>
        </div>

        <div className="rating-items">
          <input
            onChange={() => dispatchProductFilterOptions({type:"UPDATE_MINIMUM_RATING_FILTER",minRating : 2})   }
            type="radio"
            id="2-stars-or-above"
            name="rating"
            value="2-stars-or-above"
          />
          <label htmlFor="2-stars-or-above">{t("2starsAndAbove")}</label>
        </div>

        <div className="rating-items">
          <input
            onChange={() => dispatchProductFilterOptions({type:"UPDATE_MINIMUM_RATING_FILTER",minRating : 1})   }
            type="radio"
            id="1-stars-or-above"
            name="rating"
            value="1-stars-or-above"
            defaultChecked
            ref={ratingRadioBtnRef}
          />
          <label htmlFor="1-stars-or-above">{t("1starAndAbove")}</label>
        </div>
      </div>

      <div className="product-page-sortby-radio">
        <p>{t("sortBy")}</p>

        <div className="sortby-items">
          <input
            onChange={() => { setSortPriceLowToHigh(true); setSortPriceHighToLow(false); dispatchSortedProductsList({type:"PRICE_LOW_TO_HIGH"}) } }
            type="radio"
            id="price-low-to-high"
            name="sort-by"
            value="price-low-to-high"
            checked={sortPriceLowToHigh}
          />
          <label htmlFor="price-low-to-high">{t("priceLowToHigh")}</label>
        </div>

        <div className="sortby-items">
          <input
            onChange={() => { setSortPriceLowToHigh(false); setSortPriceHighToLow(true); dispatchSortedProductsList({type:"PRICE_HIGH_TO_LOW"}) } }
            type="radio"
            id="price-high-to-low"
            name="sort-by"
            value="price-high-to-low"
            checked={sortPriceHighToLow}
          />
          <label htmlFor="price-high-to-low">{t("priceHighToLow")}</label>
        </div>
      </div>

      <div className="additional-filters">
        <p>{t("additionalFilters")}</p>

        <div>
          <input
            id="out-of-stock-checkbox"
            value=""
            onChange={(e) => {setIncludeOutOfStockCheckbox(prevState=>!prevState); dispatchProductFilterOptions({type:"UPDATE_OUTOFSTOCK_FILTER"}) }  }
            type="checkbox"
            checked={includeOutOfStockCheckbox}
          />
          <label htmlFor="out-of-stock-checkbox">
            {t("includeOutOfStock")}
          </label>
        </div>

        <div>
          <input
            id="fast-delivery-available-checkbox"
            value=""
            onChange={(e) => {setFastDeliveryOnlyCheckbox(prevState=>!prevState); dispatchProductFilterOptions({type:"UPDATE_FASTDELIVERY_FILTER"})} }
            type="checkbox"
            checked={fastDeliveryOnlyCheckbox}
          />
          <label htmlFor="fast-delivery-available-checkbox">
            {t("fastDeliveryOnly")}
          </label>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar };
