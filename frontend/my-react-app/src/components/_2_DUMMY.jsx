import { useState } from "react";

function Home() {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <h1 className="text-4xl font-bold">
        Home Page
      </h1>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Error nulla harum sequi. Hic nulla fuga tempore, maxime voluptas assumenda asperiores quibusdam magni excepturi magnam ratione libero vero perferendis corporis ducimus! Perferendis sequi aliquid magnam? Minima, velit labore aliquid neque vitae veniam maiores quidem atque natus, error aliquam iste est corporis reprehenderit beatae, sit magnam unde voluptatum iusto? Tempora nulla nesciunt sed iste voluptatem ratione reiciendis ab dolorum molestias rerum doloremque odio quibusdam consectetur, nostrum dolorem dolor suscipit, sit earum, animi ut. Error modi consequuntur nesciunt tenetur debitis ullam, labore expedita perferendis neque delectus, voluptatem facilis consectetur quas, odio maiores commodi.</p>
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-8 rounded-xl shadow-xl w-96 text-center">
            
            <h2 className="text-2xl font-bold mb-4">
              Give location 
            </h2>

            <p className="mb-6">
              This is a popup.
            </p>

            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
            >
              OK
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Home;