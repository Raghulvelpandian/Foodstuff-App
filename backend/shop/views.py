import logging
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.mail import EmailMessage
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *

log = logging.getLogger(__name__)

def tokens_for(user):
    r = RefreshToken.for_user(user); return {'access': str(r.access_token), 'refresh': str(r), 'user': UserSerializer(user).data}

class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all(); serializer_class = CategorySerializer

class ProductList(generics.ListAPIView):
    serializer_class = ProductSerializer
    def get_queryset(self):
        qs = Product.objects.filter(availability=True).select_related('category'); p = self.request.query_params
        if p.get('category'): qs = qs.filter(category__slug=p['category'])
        if p.get('veg') == '1': qs = qs.filter(is_veg=True)
        if p.get('q'): qs = qs.filter(Q(name__icontains=p['q']) | Q(description__icontains=p['q']))
        return qs

class ProductDetail(generics.RetrieveAPIView):
    queryset = Product.objects.filter(availability=True).select_related('category'); serializer_class = ProductSerializer

class RegisterView(APIView):
    throttle_scope = 'auth'
    def post(self, request):
        s = RegisterSerializer(data=request.data); s.is_valid(raise_exception=True)
        return Response(tokens_for(s.save()), status=status.HTTP_201_CREATED)

class LoginView(APIView):
    throttle_scope = 'auth'
    def post(self, request):
        s = LoginSerializer(data=request.data); s.is_valid(raise_exception=True)
        user = authenticate(request, username=s.validated_data['email'].lower(), password=s.validated_data['password'])
        if not user: return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(tokens_for(user))

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_object(self): return self.request.user

class OrderList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]; throttle_scope = 'orders'
    def get_queryset(self): return Order.objects.filter(user=self.request.user).select_related('user').prefetch_related('items', 'payments', 'deliveries')
    def list(self, request, *a, **kw): return Response(OrderSerializer(self.get_queryset(), many=True).data)
    def create(self, request, *a, **kw):
        s = OrderCreateSerializer(data=request.data, context={'request': request}); s.is_valid(raise_exception=True)
        order = s.save(); return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderDetail(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]; lookup_field = 'reference'
    def get_queryset(self): return Order.objects.filter(user=self.request.user)   # customers only ever see their own orders
    def retrieve(self, request, *a, **kw): return Response(OrderSerializer(self.get_object()).data)

class ContactView(APIView):
    throttle_scope = 'contact'
    def post(self, request):
        s = ContactSerializer(data=request.data); s.is_valid(raise_exception=True); d = s.validated_data
        if d.get('website'): return Response({'detail': 'Message received.'}, status=status.HTTP_201_CREATED)   # bots: pretend success, store nothing
        msg = ContactMessage.objects.create(name=d['name'], email=d['email'], subject=' '.join(d['subject'].split()), message=d['message'], ip_address=request.META.get('REMOTE_ADDR'))
        if settings.CONTACT_RECIPIENT:
            try:
                EmailMessage(subject=f'[Foodstuff] {msg.subject}', body=f'From: {msg.name} <{msg.email}>\n\n{msg.message}', from_email=settings.DEFAULT_FROM_EMAIL,
                             to=[settings.CONTACT_RECIPIENT], reply_to=[msg.email]).send(fail_silently=False)
                msg.emailed = True; msg.save(update_fields=['emailed'])
            except Exception: log.exception('Contact email failed (message %s is saved in the database)', msg.pk)
        return Response({'detail': 'Message received.'}, status=status.HTTP_201_CREATED)
