CREATE TABLE course_participants (
    id UUID PRIMARY KEY,
    participant_code VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_course_participants_code UNIQUE (participant_code)
);

CREATE TABLE assessment_submissions (
    id UUID PRIMARY KEY,
    participant_id UUID NOT NULL,
    assessment_type VARCHAR(4) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ai_familiarity INTEGER NOT NULL,
    neuron_understanding INTEGER NOT NULL,
    ai_understanding INTEGER NOT NULL,
    CONSTRAINT fk_assessment_participant
        FOREIGN KEY (participant_id) REFERENCES course_participants (id) ON DELETE CASCADE,
    CONSTRAINT ck_assessment_type
        CHECK (assessment_type IN ('PRE', 'POST')),
    CONSTRAINT ck_ai_familiarity
        CHECK (ai_familiarity BETWEEN 1 AND 5),
    CONSTRAINT ck_neuron_understanding
        CHECK (neuron_understanding BETWEEN 1 AND 5),
    CONSTRAINT ck_ai_understanding
        CHECK (ai_understanding BETWEEN 1 AND 5),
    CONSTRAINT uk_participant_assessment_type
        UNIQUE (participant_id, assessment_type)
);

CREATE INDEX idx_assessment_submitted_at
    ON assessment_submissions (submitted_at);
