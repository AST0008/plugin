import React from "react";

const data = [
  {
    id: 101,
    Title: "Health Advocates urged to take action on COVID-19",
    Timestamp: "2022-01-01",
    Author: "John Doe",
    True_link: "https://example.com",
    Image_link: "https://placehold.co/300x200/000000/FFF",
  },
  {
    id: 102,
    Title: "Local business struggle to stay open",
    Timestamp: "2022-01-15",
    Author: "Jane Doe",
    True_link: "https://example.com",
    Image_link: "https://placehold.co/300x200/000000/FFF",
  },
  {
    id: 103,
    Title: "Community comes together to support local charities",
    Timestamp: "2022-01-20",
    Author: "Bob Doe",
    True_link: "https://example.com",
    Image_link: "https://placehold.co/300x200/000000/FFF",
  },
  {
    id: 104,
    Title: "Community comes together to support local charities",
    Timestamp: "2022-01-20",
    Author: "Bob Doe",
    True_link: "https://example.com",
    Image_link: "https://placehold.co/300x200/000000/FFF",
  },
  {
    id: 105,
    Title: "Community comes together to support local charities",
    Timestamp: "2022-01-20",
    Author: "Bob Doe",
    True_link: "https://example.com",
    Image_link: "https://placehold.co/300x200/000000/FFF",
  },
];

const Sidebar = () => {
  return (
    <main className="min-h-screen bg-slate-700 p-5">
      <h1 className="text-3xl font-bold mb-5">Health News Around You</h1>
      <div className="space-y-5">
        {data.map((article) => (
          <article
            key={article.id}
            className="card card-side bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
          >
            <figure className="w-1/3">
              <img
                src={article.Image_link}
                alt={article.Title}
                className="rounded-l-lg object-cover h-full w-full"
              />
            </figure>
            <div className="card-body p-5 flex flex-col justify-between">
              <h2 className="card-title text-xl text-slate-700 font-semibold">
                {article.Title}
              </h2>
              <p className="text-gray-600 text-sm">By {article.Author}</p>
              <p className="text-gray-500 text-xs">{article.Timestamp}</p>
              <div className="card-actions mt-3">
                <a
                  href={article.True_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full text-center"
                >
                  Read More
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};

export default Sidebar;
