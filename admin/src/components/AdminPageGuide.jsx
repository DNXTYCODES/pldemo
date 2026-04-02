import React, { useState } from "react";

const AdminPageGuide = ({
  title,
  overview,
  sections,
  buttonLabel = "See more",
  modalTitle = "Page Guide",
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-700 max-w-3xl">{overview}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {buttonLabel}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b px-6 py-5 flex-shrink-0">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {modalTitle}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="ml-4 rounded-full bg-slate-100 px-3 py-3 text-slate-700 hover:bg-slate-200 flex-shrink-0"
              >
                Close
              </button>
            </div>
            <div className="space-y-6 px-6 py-6 text-slate-700 overflow-y-auto">
              {sections.map((section) => (
                <section key={section.heading}>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {section.heading}
                  </h3>
                  <p className="mt-2 text-sm leading-6">{section.content}</p>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                      {section.bullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPageGuide;
