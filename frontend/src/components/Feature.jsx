import SpotlightCard from './SpotlightCard';

const features = [
    {
        title: "Free Courses",
        description: "Join best courses without paying anything and lifetime access"
    },
    {
        title: "Expert Instructor",
        description: "Learn from industry leaders and experienced educators."
    },
    {
        title: "Flexible Learning",
        description: "Access courses anytime, anywhere, on any device"
    }
]

const Feature = () => {
  return (
    <>
      {features.map((item) => (
        
        <SpotlightCard key={item.title} className="custom-spotlight-card flex justify-center items-center flex-col w-80 py-11 md:py-14 gap-4" spotlightColor="rgba(0, 229, 255, 0.2)">
            <h3 className="text-primary font-semibold text-lg md:text-xl">{item.title}</h3>
            <p className="text-center text-sm md:text-md font-light">{item.description}</p>
        </SpotlightCard>
        
      ))}
    </>
  )
}

export default Feature