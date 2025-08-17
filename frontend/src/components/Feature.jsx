
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
        <div key={item.title} className="w-80 flex justify-center items-center flex-col bg-secondary py-7 px-3 gap-5 hover:bg-secondary/80">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-center font-light">{item.description}</p>
        </div>
      ))}
    </>
  )
}

export default Feature