import Spinner from "@/components/Spinner";


export const LoadingScreen = () => {
	return ( 
        <div className='flex items-center justify-center h-screen'>
            <Spinner />
        </div>
        )
}

export default LoadingScreen;
