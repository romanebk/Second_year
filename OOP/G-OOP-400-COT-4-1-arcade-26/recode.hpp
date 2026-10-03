class Dynlib {
    public:
        explicit Dynlib(const std::string &path) {
            _handle = dlopen(path.c_str(), RTLD_LAZY);
            if (!_handle) {
                throw DynLibException("Failed to open library: " + path);
            }
        };
        ~Dynlib() {
            dlclose(_handle);
        };

        template<typename T>
        T getSymbol(const std::string &name) const {

        };
        Dynlib(const std::string &path) {
            std::unique_ptr<Dynlib> lib = std::make_unique<Dynlib>(path);
        };
        Dynlib& operator=(const Dynlib &other) = delete;

        Dynlib(Dynlib &&other) noexcept {
            std::unique_ptr<Dynlib>
        };
        Dynlib& operator=(Dynlib &&other) noexcept;

    private:
        void *_handle = nullptr;
        std::string _path;
};

class DynLibException : public std::exception {
    public:
        explicit DynLibException(const std::string &msg) : _message(msg) {}
        const char *what() const noexcept override {
            return _message.c_str();
        }
    private:
        std::string _message;
};