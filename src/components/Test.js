import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Test.css';
import image from '../Logo.png';

const Test = () => {
  const { sessionId } = useParams();
  const [testSession, setTestSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [failedAnswers, setFailedAnswers] = useState([]);
  const [review, setReview] = useState(false);

  // Function to shuffle an array (Fisher-Yates)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    axios
      .get(`https://petroxtestbackend.onrender.com/api/test-session/${sessionId}/`)
      .then((response) => {
        const data = response.data;
        if (data.questions) {
          data.questions = shuffleArray(data.questions);
        }
        setTestSession(data);
        setTimeLeft(data.duration ?? 300);
      })
      .catch((err) => console.error(err));
  }, [sessionId]);

  const handleSubmit = useCallback(async () => {
    if (!window.confirm("Are you sure you want to submit the test?")) return;
    
    try {
      const response = await axios.post(`https://petroxtestbackend.onrender.com/api/submit-test/${sessionId}/`, { answers });
      alert(`Test submitted! Your score: ${response.data.score}`);
      if (testSession) {
        const failed = testSession.questions.filter((q) => {
          if (q.option_a && q.option_a.trim() !== "") {
            // Multiple-choice question
            return answers[q.id] !== q.correct_option;
          } else {
            // Free-response question; compare answers case-insensitively
            return answers[q.id]?.trim().toLowerCase() !== q.correct_answer_text?.trim().toLowerCase();
          }
        });
        setFailedAnswers(failed);
      }
      setReview(true);
    } catch (error) {
      console.error(error);
      alert('Submission failed. Session Expired. Try logging in again');
    }
  }, [answers, sessionId, testSession]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, handleSubmit]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  if (!testSession)
    return (
      <div>
        <img src={image} alt="Petroxlogo" /> Loading...
      </div>
    );

  return (
    <div className="test-container">
      <div className="test-header">
        <h2>Test on {testSession.course.name}</h2>
        <div className="timer">
          <p>Time to Complete</p>
          <p className="time">
            {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
            {String(timeLeft % 60).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="test-main">
        {review ? (
          <div className="review-section">
            <h3>Review Your Incorrect Answers</h3>
            {failedAnswers.length === 0 ? (
              <p>Congratulations! You answered all questions correctly.</p>
            ) : (
              failedAnswers.map((question, index) => (
                <div key={question.id} style={{ marginBottom: '20px' }}>
                  <p style={{ fontWeight: 'bold' }}>
                    Question {index + 1}: {question.question_text}
                  </p>
                  <textarea
                    readOnly
                    value={
                      (question.option_a && question.option_a.trim() !== "")
                        ? `Your Answer: ${answers[question.id] || "No answer"} | Correct Answer: ${question.correct_option}`
                        : `Your Answer: ${answers[question.id] || "No answer"} | Correct Answer: ${question.correct_answer_text}`
                    }
                    style={{
                      width: '100%',
                      height: '100px',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      backgroundColor: '#f9f9f9',
                      color: '#333',
                    }}
                  />
                  {question.explanation && (
                    <>
                      <h4>Explanation:</h4>
                      <p>{question.explanation}</p>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="questions-section">
              {testSession.questions.map((question, index) => (
                <div key={question.id} className="question-block">
                  <p className="question-text">
                    Question {index + 1}: {question.question_text}
                  </p>
                  {question.option_a && question.option_a.trim() !== "" ? (
                    <div className="options">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <label key={opt} className="option">
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={opt}
                            checked={answers[question.id] === opt}
                            onChange={() => handleAnswerChange(question.id, opt)}
                          />
                          {question[`option_${opt.toLowerCase()}`]}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="free-answer">
                      <textarea
                        placeholder="Type your answer here..."
                        rows="4"
                        cols="50"
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
              <button onClick={handleSubmit} className="submit-button">
                Submit Test
              </button>
            </div>

            <div className="progress-section">
              <h3>Question Progress</h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(Object.keys(answers).length / testSession.questions.length) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="question-numbers">
                {testSession.questions.map((question, index) => (
                  <button
                    key={question.id}
                    className={`question-number ${answers[question.id] ? 'answered' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Test;
