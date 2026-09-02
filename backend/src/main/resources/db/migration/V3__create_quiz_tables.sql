CREATE TABLE quiz_submissions (
    id UUID PRIMARY KEY,
    participant_id UUID NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    CONSTRAINT fk_quiz_submission_participant
        FOREIGN KEY (participant_id) REFERENCES course_participants (id) ON DELETE CASCADE,
    CONSTRAINT uk_quiz_submission_participant UNIQUE (participant_id),
    CONSTRAINT ck_quiz_score_nonnegative CHECK (score >= 0),
    CONSTRAINT ck_quiz_total_positive CHECK (total_questions > 0),
    CONSTRAINT ck_quiz_score_within_total CHECK (score <= total_questions)
);

CREATE INDEX idx_quiz_submissions_submitted_at
    ON quiz_submissions (submitted_at);

CREATE TABLE quiz_answers (
    id UUID PRIMARY KEY,
    submission_id UUID NOT NULL,
    question_id VARCHAR(16) NOT NULL,
    selected_option VARCHAR(1) NOT NULL,
    CONSTRAINT fk_quiz_answer_submission
        FOREIGN KEY (submission_id) REFERENCES quiz_submissions (id) ON DELETE CASCADE,
    CONSTRAINT uk_quiz_answer_question UNIQUE (submission_id, question_id),
    CONSTRAINT ck_quiz_selected_option CHECK (selected_option IN ('A', 'B', 'C', 'D'))
);
