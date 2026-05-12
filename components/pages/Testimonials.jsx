
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "John Doe",
      role: "Student",
      quote:
        "This platform has been a game-changer for my learning. The courses are well-structured and the instructors are top-notch.",
      avatar: "/profile/john.jpg",
    },
    {
      name: "Jane Smith",
      role: "Teacher",
      quote:
        "I love how easy it is to create and manage my courses. The platform provides all the tools I need to engage with my students.",
      avatar: "/profile/jane.jpg",
    },
    {
      name: "Peter Jones",
      role: "Administrator",
      quote:
        "The management features of this platform are incredible. It has streamlined our operations and saved us a lot of time and effort.",
      avatar: "/profile/peter.jpg",
    },
  ];

  return (
    <section className="py-20 bg-slate-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            We are trusted by thousands of students, teachers, and administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 group"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-lg group-hover:rotate-3 transition-transform duration-500"
                />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {testimonial.quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
