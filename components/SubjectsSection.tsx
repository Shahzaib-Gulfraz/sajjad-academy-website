"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getColorForName } from "@/lib/data";

interface ClassData {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface CourseData {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  thumbnail: string;
  tags: string[];
  instructor: string;
}

export default function SubjectsSection() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [activeClass, setActiveClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setClasses(arr);
        if (arr.length > 0) setActiveClass(arr[0]._id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeClass) return;
    let isMounted = true;

    fetch(`/api/courses?classId=${activeClass}`)
      .then((r) => r.json())
      .then((data) => {
        if (isMounted) setCourses(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (isMounted) setLoadingCourses(false);
      });

    return () => { isMounted = false; };
  }, [activeClass]);

  if (loading) {
    return (
      <section id="subjects" className="py-20 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SubjectsSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section id="subjects" className="py-20 bg-navy-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-teal-600 text-sm font-semibold uppercase tracking-wider">
            Our Courses
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-navy-800 mt-2 mb-4">
            Explore Our Programs
          </h2>
          <p className="text-navy-500">
            Browse through our comprehensive collection of courses across
            different levels
          </p>
        </div>

        {/* Class Tabs */}
        {classes.length > 0 && (
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {classes.map((cls) => (
              <button
                key={cls._id}
                onClick={() => {
                  setActiveClass(cls._id);
                  setLoadingCourses(true);
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeClass === cls._id
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30"
                  : "bg-white text-navy-600 border border-navy-100 hover:border-teal-300 hover:text-teal-600"
                  }`}
              >
                <span className="mr-1.5">{cls.icon}</span>
                {cls.name}
              </button>
            ))}
          </div>
        )}

        {/* Courses Grid */}
        {loadingCourses ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-navy-100 overflow-hidden">
                <div className="h-44 bg-navy-50" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-navy-50 rounded" />
                  <div className="h-3 w-full bg-navy-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-navy-200 mx-auto mb-4" />
            <p className="text-navy-400 text-lg">No courses available yet</p>
            <p className="text-navy-300 text-sm mt-1">
              Check back soon for new courses!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const gradient = getColorForName(course.name);
              return (
                <Link
                  key={course._id}
                  href={`/courses/${course._id}`}
                  className="group bg-white rounded-2xl border border-navy-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Card Top */}
                  <div
                    className={`h-48 bg-navy-900 relative overflow-hidden`}
                  >
                    {course.thumbnail ? (
                      <div className="relative w-full h-full">
                        {/* Blurred Background Filler */}
                        <img
                          src={course.thumbnail}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110"
                        />
                        {/* Main Image (Full) */}
                        <img
                          src={course.thumbnail}
                          alt={course.name}
                          className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className={`absolute inset-0 bg-linear-to-br ${gradient} flex items-center justify-center`}>
                        <span className="text-6xl opacity-30">
                          {course.icon}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-navy-950/90 via-navy-950/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 backdrop-blur-md border border-teal-500/30 flex items-center justify-center text-xl shadow-lg">
                          {course.icon}
                        </div>
                        <h3 className="text-lg font-bold text-white font-serif tracking-tight drop-shadow-lg leading-tight">
                          {course.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {course.description && (
                      <p className="text-sm text-navy-500 line-clamp-2 mb-3">
                        {course.description}
                      </p>
                    )}
                    {course.instructor && (
                      <p className="text-xs text-navy-400 mb-3">
                        👨‍🏫 {course.instructor}
                      </p>
                    )}
                    {course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {course.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center text-teal-600 text-sm font-semibold group-hover:gap-2 transition-all">
                      View Course
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function SubjectsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 bg-navy-100 mx-auto rounded mb-4" />
      <div className="h-10 w-64 bg-navy-100 mx-auto rounded-lg mb-12" />
      <div className="flex justify-center gap-2 mb-10 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 bg-white border border-navy-100 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-white rounded-2xl border border-navy-100 overflow-hidden">
            <div className="h-44 bg-navy-50" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-3/4 bg-navy-50 rounded" />
              <div className="h-3 w-full bg-navy-50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
