import { useState } from "react";
import { useGetFacultyId } from "../../../hooks/useGetFaculty";
import { useCreateCourse } from "../../../hooks/useCourses";

const categories = [
  "Technology Programming",
  "Business Entrepreneurship",
  "Creative Art & Design",
  "Health and Wellness",
  "Education Teaching",
  "Personal Development",
  "Science Engineering",
  "Mathematics",
  "Social Sciences Humanities",
  "Career Professional Development",
  "Finance Economics",
  "Law Politics Society"
];

const CreateCourse = () => {

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [faculty, setFaculty] = useState("");
  const [facultySearch, setFacultySearch] = useState("");
  const [showInstructorList, setShowInstructorList] = useState(false);

  const { data: facultyList = [], isLoading, error } = useGetFacultyId();
  const {mutate: createCourse, isLoading: isCreating, error: createCourseError} = useCreateCourse();

  const filteredFaculty = (facultyList.faculty || []).filter(f =>
    f.fullName.toLowerCase().includes(facultySearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    createCourse({
      title,
      category,
      description,
      thumbnail,
      facultyId: faculty
    })
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Create Course</h2>
      <form className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Thumbnail</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={thumbnail}
            onChange={e => setThumbnail(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Instructor</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={faculty ? filteredFaculty.find(f => f.id === faculty)?.fullName || "" : ""}
              readOnly
              placeholder="No instructor selected"
            />
            <button
              type="button"
              className="px-3 py-2 bg-blue-600 text-white rounded"
              onClick={() => setShowInstructorList(true)}
            >
              Select
            </button>
          </div>
          {showInstructorList && (
            <div className="mt-2 p-4 border rounded bg-gray-50 shadow-lg absolute z-10 w-full max-w-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Select Instructor</span>
                <button
                  type="button"
                  className="text-sm text-gray-500"
                  onClick={() => setShowInstructorList(false)}
                >
                  Close
                </button>
              </div>
              <input
                type="text"
                placeholder="Search instructor..."
                value={facultySearch}
                onChange={e => setFacultySearch(e.target.value)}
                className="mb-2 w-full px-3 py-2 border rounded"
                autoFocus
              />
              <div className="max-h-48 overflow-y-auto">
                {isLoading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <div>Error loading faculty</div>
                ) : filteredFaculty.length === 0 ? (
                  <div className="text-gray-500">No matching instructor</div>
                ) : (
                  filteredFaculty.map(fac => (
                    <div
                      key={fac.id}
                      className={`cursor-pointer px-2 py-1 rounded hover:bg-blue-100 ${faculty === fac.id ? "bg-blue-200" : ""}`}
                      onClick={() => {
                        setFaculty(fac.id);
                        setShowInstructorList(false);
                        setFacultySearch("");
                      }}
                    >
                      {fac.fullName}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          disabled={isCreating}
          onClick={handleSubmit}
        >
          {isCreating ? "Creating..." : "Create Course"}
        </button>
        {createCourseError && (
          <div className="text-red-600 mt-2">
            {createCourseError.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateCourse;