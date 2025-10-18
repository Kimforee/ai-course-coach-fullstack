import pytest
from core.services.recommender import score_candidate, to_confidence


class TestRecommenderDeterminism:
    def test_score_candidate_deterministic(self):
        """Test that score_candidate returns identical results for same inputs"""
        # Test with same inputs multiple times
        inputs = (50.0, 3.0, 0.2, 0.1)  # progress, recency_gap_days, tag_gap, hint_rate
        
        score1, features1 = score_candidate(*inputs)
        score2, features2 = score_candidate(*inputs)
        score3, features3 = score_candidate(*inputs)
        
        assert score1 == score2 == score3
        assert features1 == features2 == features3

    def test_score_candidate_different_inputs(self):
        """Test that different inputs produce different scores"""
        # Test case 1: Low progress, recent activity
        score1, _ = score_candidate(20.0, 1.0, 0.1, 0.05)
        
        # Test case 2: High progress, old activity
        score2, _ = score_candidate(80.0, 10.0, 0.5, 0.3)
        
        # Test case 3: Medium progress, medium activity
        score3, _ = score_candidate(50.0, 5.0, 0.3, 0.15)
        
        # All should be different
        assert score1 != score2
        assert score2 != score3
        assert score1 != score3

    def test_score_candidate_feature_calculation(self):
        """Test that features are calculated correctly"""
        progress = 30.0
        recency_gap_days = 5.0
        tag_gap = 0.4
        hint_rate = 0.2
        
        score, features = score_candidate(progress, recency_gap_days, tag_gap, hint_rate)
        
        # Check that features match expected calculations
        expected_progress_inverse = 100 - progress
        assert features['progress_inverse'] == expected_progress_inverse
        assert features['recency_gap_days'] == recency_gap_days
        assert features['tag_gap'] == tag_gap
        assert features['hint_rate'] == hint_rate

    def test_score_candidate_scoring_logic(self):
        """Test that scoring follows expected logic"""
        # Higher progress should result in lower score (inverse relationship)
        score_low_progress, _ = score_candidate(20.0, 5.0, 0.3, 0.1)
        score_high_progress, _ = score_candidate(80.0, 5.0, 0.3, 0.1)
        
        assert score_low_progress > score_high_progress

    def test_score_candidate_edge_cases(self):
        """Test edge cases for score_candidate"""
        # Test with zero values
        score, features = score_candidate(0.0, 0.0, 0.0, 0.0)
        assert isinstance(score, float)
        assert isinstance(features, dict)
        
        # Test with maximum values
        score, features = score_candidate(100.0, 100.0, 1.0, 1.0)
        assert isinstance(score, float)
        assert isinstance(features, dict)

    def test_to_confidence_deterministic(self):
        """Test that to_confidence returns identical results for same inputs"""
        test_scores = [0.0, 0.5, 1.0, -1.0, 2.0, -2.0]
        
        for score in test_scores:
            conf1 = to_confidence(score)
            conf2 = to_confidence(score)
            conf3 = to_confidence(score)
            
            assert conf1 == conf2 == conf3

    def test_to_confidence_range(self):
        """Test that confidence values are always between 0 and 1"""
        test_scores = [-10.0, -5.0, -1.0, 0.0, 0.5, 1.0, 2.0, 5.0, 10.0]
        
        for score in test_scores:
            confidence = to_confidence(score)
            assert 0.0 <= confidence <= 1.0

    def test_to_confidence_monotonic(self):
        """Test that confidence increases with higher scores"""
        scores = [-2.0, -1.0, 0.0, 1.0, 2.0]
        confidences = [to_confidence(score) for score in scores]
        
        # Confidence should be monotonically increasing
        for i in range(1, len(confidences)):
            assert confidences[i] >= confidences[i-1]

    def test_to_confidence_sigmoid_behavior(self):
        """Test that to_confidence behaves like a sigmoid function"""
        # Very negative scores should give very low confidence
        assert to_confidence(-10.0) < 0.1
        
        # Very positive scores should give very high confidence
        assert to_confidence(10.0) > 0.9
        
        # Zero score should give moderate confidence
        zero_conf = to_confidence(0.0)
        assert 0.4 < zero_conf < 0.6

    def test_recommender_integration(self):
        """Test that score_candidate and to_confidence work together"""
        # Test a realistic scenario
        progress = 45.0
        recency_gap_days = 7.0
        tag_gap = 0.3
        hint_rate = 0.15
        
        score, features = score_candidate(progress, recency_gap_days, tag_gap, hint_rate)
        confidence = to_confidence(score)
        
        # Both should return valid results
        assert isinstance(score, float)
        assert isinstance(confidence, float)
        assert 0.0 <= confidence <= 1.0
        assert isinstance(features, dict)
        assert len(features) == 4

    def test_recommender_consistency_across_runs(self):
        """Test that the recommender produces consistent results across multiple runs"""
        test_cases = [
            (25.0, 2.0, 0.1, 0.05),
            (60.0, 8.0, 0.4, 0.2),
            (90.0, 15.0, 0.8, 0.5),
            (10.0, 1.0, 0.05, 0.01),
        ]
        
        for case in test_cases:
            # Run multiple times with same inputs
            results = []
            for _ in range(5):
                score, features = score_candidate(*case)
                confidence = to_confidence(score)
                results.append((score, features, confidence))
            
            # All results should be identical
            first_result = results[0]
            for result in results[1:]:
                assert result[0] == first_result[0]  # score
                assert result[1] == first_result[1]  # features
                assert result[2] == first_result[2]  # confidence
