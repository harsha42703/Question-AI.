import React, { useState} from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFDownloadLink, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';


const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20,
  },
  questionContainer: {
    marginBottom: 10,
    padding: 8,
    borderBottom: ' 1px solid #ccc',
  },
  question: {
    fontSize: 12,
    marginBottom: 4,
  },
  answer: {
    fontSize: 10,
    color: 'blue',
    marginTop: 4,
  },
});

function App() {
  const [questions, setQuestions] = useState('');
  const [paper, setPaper] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    type: '',
    numberOfQuestions: '',
    topic: '',
    level: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchQuestions();
    setPaper(false);
  };

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const API_KEY = "AIzaSyBJshvkJQUR9IXW2i03CUBfDWY7_ffWpqI";
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `generate a ${formValues.type} questions with no of ${formValues.numberOfQuestions} on topic of ${formValues.topic} as diificulty level of ${formValues.level} with key of answers with professional format of reponse`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (response) {
        const text = await response.text();
        console.log(text);
        setQuestions(text);
      } else {
        console.error("No response received");
        setQuestions(''); 
      }
    } catch (error) {
      console.error("Error fetching from the Generative AI API:", error);
      setQuestions(''); 
    } finally {
      setIsLoading(false);
    }
  };

  const QuestionsPDF = () => (
    <Document>
      <Page style={styles.page}>
        {questions.split('\n').map((question, index) => (
          <Text key={index} style={styles.questionContainer}>
            <Text style={styles.question}>{question.replace(/\*\*/g, '')}</Text>
          </Text>
        ))}
      </Page>
    </Document>
  );

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="sticky top-0 bg-black shadow">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
                <span className=" text-white font-bold text-2xl">Question<span className='text-cyan-200'> AI</span>.</span>
            </div>
            <nav className="md:flex space-x-10">
            {questions && (
          <div className="mt-2 text-green-700 bg-green-100 border border-green-700 focus:outline-none hover:bg-gray-100 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 ">
            <PDFDownloadLink document={<QuestionsPDF />} fileName="generated_questions.pdf">
              {({ blob, url, loading, error }) => (loading ? 'Generating PDF...' : 'Download PDF')}
            </PDFDownloadLink>
          </div>
        )}
            </nav>
          </div>
        </div>
      </header>
      <div className="max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col border border-black p-6 rounded-2xl bg-gray-200 px-4 space-y-4">
          <input 
            required
            type="text" 
            name="type" 
            value={formValues.type} 
            onChange={handleInputChange} 
            placeholder="Type of questions: MCQ, Theory, ..." 
            className="border px-4 py-2 rounded-full" 
          />
          <input 
            required
            type="text" 
            name="numberOfQuestions" 
            value={formValues.numberOfQuestions} 
            onChange={handleInputChange} 
            placeholder="No of Questions: 10 ,20 ,30 ..." 
            className="border px-4 py-2 rounded-full" 
          />
          <input 
            required
            type="text" 
            name="level" 
            value={formValues.level} 
            onChange={handleInputChange} 
            placeholder="Easy, Medium, Hard" 
            className="border px-4 py-2 rounded-full" 
          />
          <input 
            required
            type="text" 
            name="topic" 
            value={formValues.topic} 
            onChange={handleInputChange} 
            placeholder="CSE, Aptitude, Arrays, Etc..." 
            className="border px-4 py-2 rounded-full" 
          />
          <button type="submit" className="bg-black text-cyan-100  font-semibold px-4 py-2 rounded-full">Generate Questions</button>
        </form>
        {isLoading ? (
          <p className="text-center text-black mt-24 text-2xl font-bold">Generating...</p>
        ) : (
          <div className="mt-4 px-4 ">
            <h2 className="text-md sm:text-2xl md:text-2xl lg:text-2xl font-semibold  mt-8 text-center mb-8">-------- Generated Questions --------</h2>
            <div className="bg-cyan-50 border border-cyan-700 rounded-2xl shadow-2xl overflow-hidden sm:rounded-2xl">
              <div className="px-4 py-5 sm:px-6">{paper ? (<p className="text-center text-black text-sm font-bold">Generated Questions Will Be Appear Here ...</p>) : " "}
                <ul className="divide-y divide-gray-500">
                  {questions && questions.split('\n').map((question, index) => (
                    <li key={index} className="py-4">
                      <div className={`flex items-center justify-between ${question.includes("**") ? ' text-lg text-cyan-700' : 'font-semibold'}`}>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-600 mr-2"></span>
                          <p className="text-sm">{question.includes("**") ? <span className="font-bold">{question.replace(/\*\*/g, '')}</span> : question}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
