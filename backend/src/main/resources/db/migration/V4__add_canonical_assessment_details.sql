ALTER TABLE assessment_submissions ADD COLUMN neuron_parts_rating INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN neuron_signals_rating INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN biology_ai_relationship_rating INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN artificial_networks_rating INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN learning_from_feedback_rating INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN continued_interest_rating INTEGER;
ALTER TABLE assessment_submissions ADD COLUMN learning_goal VARCHAR(2000);
ALTER TABLE assessment_submissions ADD COLUMN most_helpful VARCHAR(2000);
ALTER TABLE assessment_submissions ADD COLUMN improvement_ideas VARCHAR(2000);
ALTER TABLE assessment_submissions ADD COLUMN additional_comments VARCHAR(2000);
ALTER TABLE assessment_submissions ADD COLUMN skipped BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE assessment_submissions ADD CONSTRAINT ck_neuron_parts_rating
    CHECK (neuron_parts_rating BETWEEN 1 AND 5);
ALTER TABLE assessment_submissions ADD CONSTRAINT ck_neuron_signals_rating
    CHECK (neuron_signals_rating BETWEEN 1 AND 5);
ALTER TABLE assessment_submissions ADD CONSTRAINT ck_biology_ai_relationship_rating
    CHECK (biology_ai_relationship_rating BETWEEN 1 AND 5);
ALTER TABLE assessment_submissions ADD CONSTRAINT ck_artificial_networks_rating
    CHECK (artificial_networks_rating BETWEEN 1 AND 5);
ALTER TABLE assessment_submissions ADD CONSTRAINT ck_learning_from_feedback_rating
    CHECK (learning_from_feedback_rating BETWEEN 1 AND 5);
ALTER TABLE assessment_submissions ADD CONSTRAINT ck_continued_interest_rating
    CHECK (continued_interest_rating BETWEEN 1 AND 5);
