

#ifndef __UIRICHTEXTEX_H__
#define __UIRICHTEXTEX_H__

#include "ui/UIRichText.h"

NS_CC_BEGIN

class Label;

namespace ui {
    
class RichElementEx : public Ref
{
public:
	RichElementEx(){};
	virtual ~RichElementEx(){};
    enum class Type
    {
        TEXT,
        IMAGE,
        CUSTOM,
        NEWLINE
    };
    typedef std::function<void(Ref*, Ref*)> ccRichElementExClickCallback;
    bool init(int tag, const Color3B& color, GLubyte opacity);
    Type getType() const { return _type; }
    int getTag() const { return _tag; }
    const Color3B &getColor() const { return _color; }
    GLubyte getOpacity() const { return _opacity; }
    void setClickCallback(const ccRichElementExClickCallback &clickCallback) { _clickCallback = clickCallback; }
    const ccRichElementExClickCallback &getClickCallback() const { return _clickCallback; }

protected:
    Type _type;
    int _tag;
    Color3B _color;
    GLubyte _opacity;
    ccRichElementExClickCallback _clickCallback;
    friend class RichTextEx;
};

class RichElementTextEx : public RichElementEx
{
public:
    RichElementTextEx(){_type = Type::TEXT; _underlineEnable = false; _outlineEnable = false;};
    virtual ~RichElementTextEx(){};
    bool init(int tag, const Color3B& color, GLubyte opacity, const std::string& text, const std::string& fontName, float fontSize);
    static RichElementTextEx* create(int tag, const Color3B& color, GLubyte opacity, const std::string& text, const std::string& fontName, float fontSize);
    const std::string &getText() const { return _text; }
    const std::string &getFontName() const { return _fontName; }
    float getFontSize() const { return _fontSize; }
    void enableUnderline() { _underlineEnable = true; }
    void disableUnderline() { _underlineEnable = false; }
    void enableOutline(const Color3B &outlineColor, float outlineSize){_outlineEnable = true; _outlineColor = outlineColor; _outlineSize = outlineSize;}
    void disableOutline() { _outlineEnable = false; }

protected:
    std::string _text;
    std::string _fontName;
    float _fontSize;
    bool _underlineEnable;
    bool _outlineEnable;
    Color3B _outlineColor;
    float _outlineSize;
    friend class RichTextEx;
    
};

class RichElementImageEx : public RichElementEx
{
public:
    enum class TextureType
    {
        LOCAL,
        PLIST
    };
    RichElementImageEx(){_type = Type::IMAGE; _textureType = TextureType::LOCAL; _scaleX = _scaleY = 1.0f;};
    virtual ~RichElementImageEx(){};
    bool init(int tag, const Color3B& color, GLubyte opacity, const std::string& filePath, TextureType textureType);
    static RichElementImageEx* create(int tag, const Color3B& color, GLubyte opacity, const std::string& filePath, TextureType textureType);
    const std::string &getFilePath() const { return _filePath; }
    TextureType getTextureType() const { return _textureType; }
    void setScale(float scale){_scaleX = _scaleY = scale;}
    void setScale(float scaleX, float scaleY){_scaleX = scaleX; _scaleY = scaleY;}
    void setScaleX(float scaleX){_scaleX = scaleX;}
    void setScaleY(float scaleY){_scaleY = scaleY;}

protected:
    std::string _filePath;
    Rect _textureRect;
    TextureType _textureType;
    float _scaleX;
    float _scaleY;
    friend class RichTextEx;
};

class RichElementCustomNodeEx : public RichElementEx
{
public:
    RichElementCustomNodeEx(){_type = Type::CUSTOM;};
    virtual ~RichElementCustomNodeEx(){CC_SAFE_RELEASE(_customNode);};
    bool init(int tag, const Color3B& color, GLubyte opacity, Node* customNode);
    static RichElementCustomNodeEx* create(int tag, const Color3B& color, GLubyte opacity, Node* customNode);
protected:
    Node* _customNode;
    friend class RichTextEx;
};

class RichElementNewLineEx : public RichElementEx
{
public:
    RichElementNewLineEx(){_type = Type::NEWLINE;};
    virtual ~RichElementNewLineEx(){};
    bool init(int tag);
    static RichElementNewLineEx* create(int tag);
protected:
    friend class RichTextEx;
};
    
class RichTextEx : public Widget
{
public:
    RichTextEx();
    virtual ~RichTextEx();
    static RichTextEx* create();
    void insertElement(RichElementEx* element, int index);
    void pushBackElement(RichElementEx* element);
    void removeElement(int index);
    void removeElement(RichElementEx* element);
    virtual void visit(cocos2d::Renderer *renderer, const Mat4 &parentTransform, uint32_t parentFlags) override;
    void setVerticalSpace(float space);
    float getVerticalSpace() const;
    void setEmptyLineHeight(float height);
    float getEmptyLineHeight() const;
    void setHorizontalAlignment(TextHAlignment alignment);
    TextHAlignment getHorizontalAlignment() const;
    virtual void setAnchorPoint(const Vec2 &pt);
//    virtual const Size getVirtualRendererSize() const override;
    void formatText();
    virtual void ignoreContentAdaptWithSize(bool ignore);
    virtual std::string getDescription() const override;

CC_CONSTRUCTOR_ACCESS:
    virtual bool init() override;
    
protected:
    virtual void initRenderer();
    void pushToContainer(Node* renderer);
    void handleTextRenderer(RichElementTextEx* elmtText, const std::string& text, const std::string& fontName, float fontSize, const Color3B& color, GLubyte opacity);
    void handleImageRenderer(RichElementImageEx* elmtImage, const std::string& fileParh, const Color3B& color, GLubyte opacity);
    void handleCustomRenderer(RichElementEx* element, Node* renderer);
    void formatRenderers();
    void addNewLine();
    virtual void releaseUpEvent() override;
    virtual void cancelUpEvent() override;

protected:
    bool _formatTextDirty;
    Vector<RichElementEx*> _richElements;
    std::vector<Vector<Node*>*> _elementRenders;
    float _leftSpaceWidth;
    float _verticalSpace;
    float _emptyLineHeight;
    TextHAlignment _hAlignment;
    Node* _elementRenderersContainer;
};

}

NS_CC_END

#endif
