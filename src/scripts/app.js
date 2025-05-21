document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formStatus = document.getElementById('formStatus');
    const submitButton = e.target.querySelector('.submit-button');
    
    // Get form data
    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        message: e.target.message.value
    };

    console.log('Sending form data:', formData);

    try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Send the form data to the server using the current domain
        console.log('Sending request to:', window.location.origin + '/api/contact');
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (response.ok) {
            // Show success message with delivery note
            formStatus.textContent = 'Message sent successfully! Please check your email (and spam folder) in a few minutes.';
            formStatus.className = 'form-status success';
            e.target.reset();
        } else {
            throw new Error(data.message || 'Server error');
        }
    } catch (error) {
        // Show error message
        formStatus.textContent = 'Error sending message. Please try again.';
        formStatus.className = 'form-status error';
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
});