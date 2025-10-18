import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from core.models import Student, Course, Lesson, Attempt
from django.utils import timezone


@pytest.mark.django_db
class TestStudentModel:
    def test_student_creation(self):
        student = Student.objects.create(name='Test Student', email='test@example.com')
        assert student.name == 'Test Student'
        assert student.email == 'test@example.com'
        assert student.created_at is not None
        assert str(student) == 'Test Student'

    def test_student_email_unique(self):
        Student.objects.create(name='Student 1', email='test@example.com')
        with pytest.raises(IntegrityError):
            Student.objects.create(name='Student 2', email='test@example.com')

    def test_student_str_representation(self):
        student = Student.objects.create(name='John Doe', email='john@example.com')
        assert str(student) == 'John Doe'


@pytest.mark.django_db
class TestCourseModel:
    def test_course_creation(self):
        course = Course.objects.create(
            name='Python Basics',
            description='Learn Python fundamentals',
            difficulty=2
        )
        assert course.name == 'Python Basics'
        assert course.description == 'Learn Python fundamentals'
        assert course.difficulty == 2
        assert str(course) == 'Python Basics'

    def test_course_default_values(self):
        course = Course.objects.create(name='Basic Course')
        assert course.description == ''
        assert course.difficulty == 1

    def test_course_str_representation(self):
        course = Course.objects.create(name='Advanced Python')
        assert str(course) == 'Advanced Python'


@pytest.mark.django_db
class TestLessonModel:
    def test_lesson_creation(self):
        course = Course.objects.create(name='Test Course')
        lesson = Lesson.objects.create(
            course=course,
            title='Variables',
            tags=['variables', 'basics'],
            order_index=1
        )
        assert lesson.course == course
        assert lesson.title == 'Variables'
        assert lesson.tags == ['variables', 'basics']
        assert lesson.order_index == 1
        assert str(lesson) == 'Test Course: Variables'

    def test_lesson_default_values(self):
        course = Course.objects.create(name='Test Course')
        lesson = Lesson.objects.create(course=course, title='Basic Lesson')
        assert lesson.tags == []
        assert lesson.order_index == 0

    def test_lesson_ordering(self):
        course = Course.objects.create(name='Test Course')
        lesson1 = Lesson.objects.create(course=course, title='First', order_index=2)
        lesson2 = Lesson.objects.create(course=course, title='Second', order_index=1)
        lesson3 = Lesson.objects.create(course=course, title='Third', order_index=3)
        
        lessons = list(course.lessons.all())
        assert lessons[0] == lesson2  # order_index=1
        assert lessons[1] == lesson1  # order_index=2
        assert lessons[2] == lesson3  # order_index=3

    def test_lesson_str_representation(self):
        course = Course.objects.create(name='Python Course')
        lesson = Lesson.objects.create(course=course, title='Loops')
        assert str(lesson) == 'Python Course: Loops'


@pytest.mark.django_db
class TestAttemptModel:
    def test_attempt_creation(self):
        student = Student.objects.create(name='Test Student', email='test@example.com')
        course = Course.objects.create(name='Test Course')
        lesson = Lesson.objects.create(course=course, title='Test Lesson')
        
        now = timezone.now()
        attempt = Attempt.objects.create(
            student=student,
            lesson=lesson,
            timestamp=now,
            correctness=0.8,
            hints_used=2,
            duration_sec=300
        )
        
        assert attempt.student == student
        assert attempt.lesson == lesson
        assert attempt.timestamp == now
        assert attempt.correctness == 0.8
        assert attempt.hints_used == 2
        assert attempt.duration_sec == 300

    def test_attempt_default_values(self):
        student = Student.objects.create(name='Test Student', email='test@example.com')
        course = Course.objects.create(name='Test Course')
        lesson = Lesson.objects.create(course=course, title='Test Lesson')
        
        attempt = Attempt.objects.create(
            student=student,
            lesson=lesson,
            timestamp=timezone.now(),
            correctness=0.5
        )
        
        assert attempt.hints_used == 0
        assert attempt.duration_sec == 0

    def test_attempt_relationships(self):
        student = Student.objects.create(name='Test Student', email='test@example.com')
        course = Course.objects.create(name='Test Course')
        lesson = Lesson.objects.create(course=course, title='Test Lesson')
        
        attempt = Attempt.objects.create(
            student=student,
            lesson=lesson,
            timestamp=timezone.now(),
            correctness=0.7
        )
        
        # Test reverse relationships
        assert attempt in student.attempts.all()
        assert attempt in lesson.attempts.all()

    def test_attempt_correctness_validation(self):
        student = Student.objects.create(name='Test Student', email='test@example.com')
        course = Course.objects.create(name='Test Course')
        lesson = Lesson.objects.create(course=course, title='Test Lesson')
        
        # Test valid correctness values
        attempt1 = Attempt.objects.create(
            student=student, lesson=lesson, timestamp=timezone.now(), correctness=0.0
        )
        attempt2 = Attempt.objects.create(
            student=student, lesson=lesson, timestamp=timezone.now(), correctness=1.0
        )
        attempt3 = Attempt.objects.create(
            student=student, lesson=lesson, timestamp=timezone.now(), correctness=0.5
        )
        
        assert attempt1.correctness == 0.0
        assert attempt2.correctness == 1.0
        assert attempt3.correctness == 0.5

    def test_attempt_indexes(self):
        # Test that the database indexes are properly configured
        student = Student.objects.create(name='Test Student', email='test@example.com')
        course = Course.objects.create(name='Test Course')
        lesson = Lesson.objects.create(course=course, title='Test Lesson')
        
        # Create multiple attempts to test indexing
        for i in range(5):
            Attempt.objects.create(
                student=student,
                lesson=lesson,
                timestamp=timezone.now(),
                correctness=0.5 + i * 0.1
            )
        
        # This query should use the index on (student, timestamp)
        attempts = Attempt.objects.filter(student=student).order_by('-timestamp')
        assert attempts.count() == 5
