import { useEffect, useReducer, useContext, createContext, useState, useRef} from 'react'
import axios from 'axios'

const ProductsContext = createContext()

// Initialize productList as empty array
let productList = []

let filterOptionsObject = {
    includeOutOfStock        : true,
    onlyFastDeliveryProducts : false,
    minPrice                 : 0,
    maxPrice                 : 2000000,
    fiction                  : true,
    thriller                 : true,
    tech                     : true,
    philosophy               : true,
    romance                  : true,
    manga                    : true,
    minRating                : 1
}

function updateProductFilters(state, action)
{
    switch(action.type)
    {
        case "UPDATE_OUTOFSTOCK_FILTER" : 
            {
                return {...state, includeOutOfStock : !(state.includeOutOfStock)}
            }

        case "UPDATE_FASTDELIVERY_FILTER" : 
            {
                return {...state, onlyFastDeliveryProducts : !(state.onlyFastDeliveryProducts)}
            }
        
        case "UPDATE_MIN_PRICE_RANGE_FILTER" :
            {
                return {...state, minPrice : action.minPrice}
            }
        
        case "UPDATE_MAX_PRICE_RANGE_FILTER" :
            {
                return {...state, maxPrice : action.maxPrice}
            }
        case "UPDATE_FICTION_FILTER":
            {
                return {...state, fiction : !(state.fiction) }
            }
        case "UPDATE_THRILLER_FILTER":
            {
                return {...state, thriller : !(state.thriller) }
            }
        case "UPDATE_TECH_FILTER":
            {
                return {...state, tech : !(state.tech) }
            }
        case "UPDATE_PHILOSOPHY_FILTER":
            {
                return {...state, philosophy : !(state.philosophy) }
            }
        case "UPDATE_ROMANCE_FILTER":
            {
                return {...state, romance : !(state.romance) }
            }
        case "UPDATE_MANGA_FILTER":
            {
                return {...state, manga : !(state.manga) }
            }
        case "UPDATE_MINIMUM_RATING_FILTER":
            {
                return {...state, minRating : action.minRating}
            }
        case "SELECT_ONLY_FICTION_FILTER":
            {
                return {
                    ...state,
                    includeOutOfStock        : true,
                    onlyFastDeliveryProducts : false,
                    minPrice                 : 0,
                    maxPrice                 : 2000000,
                    fiction                  : true,
                    thriller                 : false,
                    tech                     : false,
                    philosophy               : false,
                    romance                  : false,
                    manga                    : false,
                    minRating                : 1
                }
            }
        case "SELECT_ONLY_THRILLER_FILTER":
            {
                return {
                    ...state,
                    includeOutOfStock        : true,
                    onlyFastDeliveryProducts : false,
                    minPrice                 : 0,
                    maxPrice                 : 2000000,
                    fiction                  : false,
                    thriller                 : true,
                    tech                     : false,
                    philosophy               : false,
                    romance                  : false,
                    manga                    : false,
                    minRating                : 1
                }  
            }
        case "SELECT_ONLY_TECH_FILTER":
            {
                return {
                    ...state,
                    includeOutOfStock        : true,
                    onlyFastDeliveryProducts : false,
                    minPrice                 : 0,
                    maxPrice                 : 2000000,
                    fiction                  : false,
                    thriller                 : false,
                    tech                     : true,
                    philosophy               : false,
                    romance                  : false,
                    manga                    : false,
                    minRating                : 1
                }  
            }
        case "SELECT_ONLY_PHILOSOPHY_FILTER" :
            {
                return {
                    ...state,
                    includeOutOfStock        : true,
                    onlyFastDeliveryProducts : false,
                    minPrice                 : 0,
                    maxPrice                 : 2000000,
                    fiction                  : false,
                    thriller                 : false,
                    tech                     : false,
                    philosophy               : true,
                    romance                  : false,
                    manga                    : false,
                    minRating                : 1
                }  
            }
        case "SELECT_ONLY_ROMANCE_FILTER" :
            {
                return {
                    ...state,
                    includeOutOfStock        : true,
                    onlyFastDeliveryProducts : false,
                    minPrice                 : 0,
                    maxPrice                 : 2000000,
                    fiction                  : false,
                    thriller                 : false,
                    tech                     : false,
                    philosophy               : false,
                    romance                  : true,
                    manga                    : false,
                    minRating                : 1
                }  
            }
        case "SELECT_ONLY_MANGA_FILTER" :
            {
                return {
                    ...state,
                    includeOutOfStock        : true,
                    onlyFastDeliveryProducts : false,
                    minPrice                 : 0,
                    maxPrice                 : 2000000,
                    fiction                  : false,
                    thriller                 : false,
                    tech                     : false,
                    philosophy               : false,
                    romance                  : false,
                    manga                    : true,
                    minRating                : 1
                }  
            }
        case "RESET_DEFAULT_FILTERS":
            {
                return {
                    ...state,
                    includeOutOfStock        : true,
                    onlyFastDeliveryProducts : false,
                    minPrice                 : 0,
                    maxPrice                 : 2000000,
                    fiction                  : true,
                    thriller                 : true,
                    tech                     : true,
                    philosophy               : true,
                    romance                  : true,
                    manga                    : true,
                    minRating                : 1
                }
            }
        default : return [...state]
    }
}

function productsOrderFunc(state,action)
{
    switch(action.type)
    {
        case "PRICE_HIGH_TO_LOW" : 
            {
                return [...state].sort((a,b)=>b.discountedPrice-a.discountedPrice)
            }

        case "PRICE_LOW_TO_HIGH" : 
            {
                return [...state].sort((a,b)=>a.discountedPrice-b.discountedPrice)
            }

        case "UPDATE_LIST_AS_PER_FILTERS" : 
            {
                // Check if productList exists and has data
                if (!productList || productList.length === 0) {
                    console.log('No productList available for filtering');
                    return state || []
                }
                
                console.log('Filtering products:', productList.length, 'with options:', {
                    minPrice: action.payload.minPrice,
                    maxPrice: action.payload.maxPrice,
                    genres: Object.keys(action.payload).filter(k => action.payload[k] === true && ['fiction','thriller','tech','philosophy','romance','manga'].includes(k))
                });
                
                let filteredProducts;
                
                if(action.payload.includeOutOfStock===true)
                {
                    //All products
                    filteredProducts = (action.payload.onlyFastDeliveryProducts===false) 
                    ? productList.filter(item=> {
                        const priceOk = action.payload.minPrice <= item.discountedPrice && item.discountedPrice <= action.payload.maxPrice;
                        const genreOk = action.payload[item.genre] === true;
                        const ratingOk = item.rating >= action.payload.minRating;
                        
                        return priceOk && genreOk && ratingOk;
                      })
                    : productList.filter(item=> {
                        const fastDelivery = item.fastDeliveryAvailable === true;
                        const priceOk = action.payload.minPrice <= item.discountedPrice && item.discountedPrice <= action.payload.maxPrice;
                        const genreOk = action.payload[item.genre] === true;
                        const ratingOk = item.rating >= action.payload.minRating;
                        
                        return fastDelivery && priceOk && genreOk && ratingOk;
                    });
                }
                else
                {
                    //Only available products
                    filteredProducts = (action.payload.onlyFastDeliveryProducts===false) 
                    ? productList.filter(item=> {
                        const inStock = item.outOfStock === false;
                        const priceOk = action.payload.minPrice <= item.discountedPrice && item.discountedPrice <= action.payload.maxPrice;
                        const genreOk = action.payload[item.genre] === true;
                        const ratingOk = item.rating >= action.payload.minRating;
                        
                        return inStock && priceOk && genreOk && ratingOk;
                    })
                    : productList.filter(item=> {
                        const inStock = item.outOfStock === false;
                        const fastDelivery = item.fastDeliveryAvailable === true;
                        const priceOk = action.payload.minPrice <= item.discountedPrice && item.discountedPrice <= action.payload.maxPrice;
                        const genreOk = action.payload[item.genre] === true;
                        const ratingOk = item.rating >= action.payload.minRating;
                        
                        return inStock && fastDelivery && priceOk && genreOk && ratingOk;
                    });
                }
                
                console.log('Filtered result:', filteredProducts.length, 'products');
                
                // If no products match filters, return all products as fallback
                if (filteredProducts.length === 0 && productList.length > 0) {
                    console.log('⚠️ No products match filters, showing all products');
                    return productList;
                }
                
                return filteredProducts;
            }

        case "ADD_ITEMS_TO_PRODUCTS_AVAILABLE_LIST":
            {
                return [...action.payload]
            }

        default : return [...state]
    }
}

let ProductsProvider = ({children}) => 
{
    const isMounted = useRef(true)
    const [ productsAvailableList, dispatchSortedProductsList] = useReducer(productsOrderFunc, [])
    const [ productFilterOptions, dispatchProductFilterOptions ] = useReducer(updateProductFilters,filterOptionsObject)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
      (async () => {
        try {
            if (!isMounted.current) return
            setLoading(true)
            const productsAvailableData = await axios.get('http://localhost:5000/api/home/products')
            if (isMounted.current && productsAvailableData.data && productsAvailableData.data.productsList) {
                productList = [...productsAvailableData.data.productsList]
                
                console.log('=== PRODUCTS LOADED ===');
                console.log('Product count:', productList.length);
                console.log('Sample product:', productList[0]);
                console.log('Available genres:', [...new Set(productList.map(p => p.genre))]);
                
                // Load products first
                dispatchSortedProductsList({type: "ADD_ITEMS_TO_PRODUCTS_AVAILABLE_LIST", payload: productList})
                
                // NO automatic filtering on load - show all products initially
            }
            if (isMounted.current) {
                setLoading(false)
            }
        }
        catch(error) {
            console.log("Error fetching products: ", error)
            if (isMounted.current) {
                setLoading(false)
            }
        }
      })()
    },[])

    return (
        <ProductsContext.Provider value={{ productsAvailableList, dispatchSortedProductsList, productFilterOptions, dispatchProductFilterOptions, loading}}>
            {children}
        </ProductsContext.Provider>
    )
}

let useProductAvailable = () => useContext(ProductsContext)

export { ProductsProvider, useProductAvailable}