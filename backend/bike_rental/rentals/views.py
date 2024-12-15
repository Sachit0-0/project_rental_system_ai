from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline

from .models import Bike, Rental, Review
from .serializers import BikeSerializer, RentalSerializer, UserSerializer, ReviewSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_serializer = UserSerializer(user)
        rentals = Rental.objects.filter(user=user)
        rental_serializer = RentalSerializer(rentals, many=True)

        response_data = {
            'user_info': user_serializer.data,
            'rental_history': rental_serializer.data
        }

        return Response(response_data)




from rest_framework.exceptions import ValidationError


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]



    def get_queryset(self):
        queryset = Review.objects.all()

        # Filter reviews by bike_id if provided
        bike_id = self.request.query_params.get('bike_id', None)
        if bike_id:
            queryset = queryset.filter(bike_id=bike_id)

        return queryset
    def perform_create(self, serializer):
        user = self.request.user
        bike = serializer.validated_data['bike']  # Get the bike from validated data

        # Check if the user has already reviewed this bike
        if Review.objects.filter(user=user, bike=bike).exists():
            raise ValidationError("You can only submit one review per bike.")
        
        # Save the review with the authenticated user
        serializer.save(user=user)


class BikeViewSet(viewsets.ModelViewSet):
    queryset = Bike.objects.filter(availability=True)
    serializer_class = BikeSerializer
    permission_classes = [AllowAny]


class RentalViewSet(viewsets.ModelViewSet):
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        bike = Bike.objects.get(id=request.data['bike'])
        if not bike.availability:
            return Response({"error": "Bike is not available"}, status=status.HTTP_400_BAD_REQUEST)

        rental_days = request.data.get('rental_days', 1)
        end_time = timezone.now() + timedelta(days=rental_days)

        rental = Rental.objects.create(user=request.user, bike=bike, end_time=end_time)
        bike.availability = False
        bike.save()

        return Response(RentalSerializer(rental).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        rental = self.get_object()
        rental.end_time = timezone.now()
        duration = (rental.end_time - rental.start_time).total_seconds() / 3600
        rental.total_price = duration * rental.bike.price_per_hour
        rental.save()

        rental.bike.availability = True
        rental.bike.save()

        return Response(RentalSerializer(rental).data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            gender = request.data.get('gender')
            user = serializer.save(gender=gender)
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)


class BikeRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        bikes = Bike.objects.filter(availability=True)
        scored_bikes = []
        for bike in bikes:
            score = 1 if (user.gender.lower() == "m" and bike.bike_type.lower() == "bike") else 0
            scored_bikes.append((bike, score))

        scored_bikes.sort(key=lambda x: x[1], reverse=True)
        sorted_bikes = [bike for bike, _ in scored_bikes]
        serializer = BikeSerializer(sorted_bikes, many=True, context={'request': request})
        
        return Response(serializer.data)


   
     
class SimilarBikesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, bike_id):
        """
        Return a list of similar bikes to the given bike_id.
        """
        # Load the similarity model
        similarity_model = pipeline('feature-extraction', model='bert-base-uncased')
        
        try:
            bike = Bike.objects.get(id=bike_id)
        except Bike.DoesNotExist:
            return Response({"error": "Bike not found."}, status=status.HTTP_404_NOT_FOUND)

        # Get all similar bikes without filtering by bike type
        similar_bikes = Bike.objects.filter(availability=True).exclude(id=bike_id)
        
        if not similar_bikes:
            return Response({"message": "No similar bikes found."}, status=status.HTTP_200_OK)

        # Get the embeddings for the current bike
        current_bike_embedding = similarity_model(bike.model)[0]
        current_bike_embedding = current_bike_embedding[0]

        # Get the embeddings for all the similar bikes
        bike_embeddings = []
        for b in similar_bikes:
            embedding = similarity_model(b.model if b.model else b.bike_type)[0]
            bike_embeddings.append(embedding[0])

        # Calculate the cosine similarity between the current bike and all the similar bikes
        similarities = cosine_similarity([current_bike_embedding], bike_embeddings)
        # Sort the bikes by their similarity
        sorted_bikes = sorted(zip(similar_bikes, similarities[0]), key=lambda x: x[1], reverse=True)

        # Get the sorted bike objects
        sorted_bike_objects = [b[0] for b in sorted_bikes]

        # Serialize the sorted bikes and return the response
        serializer = BikeSerializer(sorted_bike_objects, many=True, context={'request': request})
        return Response(serializer.data)

